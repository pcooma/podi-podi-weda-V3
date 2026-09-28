import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getApps, initializeApp } from "firebase-admin/app";
import { Storage } from "@google-cloud/storage";
import type { Pool } from "pg";
import type { AppConfig } from "./config.js";
import { requireAuth, type AuthenticatedRequest } from "./auth.js";
import { normalizeUsername, safeFilename } from "./identity.js";
import { providerProfileSchema, uploadRequestSchema } from "./schemas.js";

export function createApp(config: AppConfig, pool: Pool, storage = new Storage()) {
  if (!getApps().length) initializeApp({ projectId: config.GOOGLE_CLOUD_PROJECT });
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigins, methods: ["GET", "POST", "PUT", "OPTIONS"] }));
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/v1", requireAuth);

  app.get("/v1/me", async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = await pool.query(
        `SELECT u.id, u.firebase_uid, u.email, u.phone, u.status, u.preferred_language,
                p.display_name, p.username, p.contact_phone, p.contact_phone_verified,
                p.district, p.provider_category, p.skills, p.experience_years, p.evidence_summary,
                COALESCE(array_agg(r.role) FILTER (WHERE r.role IS NOT NULL), '{}') roles
           FROM users u
           LEFT JOIN user_profiles p ON p.user_id = u.id
           LEFT JOIN user_roles r ON r.user_id = u.id
          WHERE u.firebase_uid = $1
          GROUP BY u.id, p.user_id`,
        [req.user!.uid]
      );
      res.json({ user: result.rows[0] || null });
    } catch (error) { next(error); }
  });

  app.put("/v1/provider-profile", async (req: AuthenticatedRequest, res, next) => {
    const parsed = providerProfileSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid profile", details: parsed.error.flatten() }); return; }
    const profile = parsed.data;
    if (!req.user!.emailVerified && !req.user!.phone) {
      res.status(403).json({ error: "Verify your email or phone before saving a profile" });
      return;
    }
    const username = normalizeUsername(profile.username);
    if (username.length < 3) { res.status(400).json({ error: "Username must contain at least 3 valid characters" }); return; }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userResult = await client.query(
        `INSERT INTO users (firebase_uid, email, phone, preferred_language, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (firebase_uid) DO UPDATE SET
           email = COALESCE(EXCLUDED.email, users.email), phone = EXCLUDED.phone,
           preferred_language = EXCLUDED.preferred_language, updated_at = now()
         RETURNING id`,
        [req.user!.uid, req.user!.email || null, req.user!.phone || null, profile.preferredLanguage]
      );
      const userId = userResult.rows[0].id;
      await client.query(
        `INSERT INTO usernames (username, user_id) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username`,
        [username, userId]
      );
      await client.query(
        `INSERT INTO user_profiles (user_id, display_name, username, contact_phone, contact_phone_verified,
                                    district, provider_category, skills, experience_years, evidence_summary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (user_id) DO UPDATE SET display_name=EXCLUDED.display_name,
           username=EXCLUDED.username, contact_phone=EXCLUDED.contact_phone,
           contact_phone_verified=EXCLUDED.contact_phone_verified, district=EXCLUDED.district,
           provider_category=EXCLUDED.provider_category, skills=EXCLUDED.skills,
           experience_years=EXCLUDED.experience_years, evidence_summary=EXCLUDED.evidence_summary,
           updated_at=now()`,
        [userId, profile.displayName, username, profile.phone, req.user!.phone === profile.phone,
          profile.district, profile.category, profile.skills, profile.experienceYears, profile.evidenceSummary]
      );
      await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'provider') ON CONFLICT DO NOTHING", [userId]);
      await client.query("INSERT INTO audit_logs (actor_user_id, action, target_type, target_id) VALUES ($1,'profile.upsert','user',$1)", [userId]);
      await client.query("COMMIT");
      res.json({ userId, username, saved: true });
    } catch (error: any) {
      await client.query("ROLLBACK");
      if (error?.code === "23505") { res.status(409).json({ error: "That username, email, or phone is already in use" }); return; }
      next(error);
    } finally { client.release(); }
  });

  app.post("/v1/documents/upload-url", async (req: AuthenticatedRequest, res, next) => {
    const parsed = uploadRequestSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid document request", details: parsed.error.flatten() }); return; }
    if (parsed.data.size > config.MAX_DOCUMENT_BYTES) { res.status(413).json({ error: "Document is too large" }); return; }
    try {
      const owner = await pool.query("SELECT id FROM users WHERE firebase_uid=$1", [req.user!.uid]);
      if (!owner.rows[0]) { res.status(409).json({ error: "Create your profile before uploading documents" }); return; }
      const id = crypto.randomUUID();
      const filename = safeFilename(parsed.data.filename);
      const visibility = parsed.data.type === "portfolio" ? "public" : "private";
      const path = `users/${req.user!.uid}/${visibility}/${parsed.data.type}/${id}-${filename}`;
      const inserted = await pool.query(
        `INSERT INTO user_documents
           (id, owner_user_id, document_type, original_filename, storage_path, content_type,
            declared_size, status, consent_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'uploading',$8)
         RETURNING id, document_type, status, created_at`,
        [id, owner.rows[0].id, parsed.data.type, parsed.data.filename, path,
          parsed.data.contentType, parsed.data.size, parsed.data.consentVersion]
      );
      const [uploadUrl] = await storage.bucket(config.DOCUMENT_BUCKET).file(path).getSignedUrl({
        version: "v4", action: "write", expires: Date.now() + 10 * 60 * 1000,
        contentType: parsed.data.contentType
      });
      res.status(201).json({ document: inserted.rows[0], uploadUrl, expiresInSeconds: 600 });
    } catch (error) { next(error); }
  });

  app.post("/v1/documents/:id/complete", async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = await pool.query(
        `SELECT d.id, d.storage_path, d.content_type, d.declared_size
           FROM user_documents d JOIN users u ON u.id=d.owner_user_id
          WHERE d.id=$1 AND u.firebase_uid=$2 AND d.status='uploading'`,
        [req.params.id, req.user!.uid]
      );
      const doc = result.rows[0];
      if (!doc) { res.status(404).json({ error: "Pending document not found" }); return; }
      const [metadata] = await storage.bucket(config.DOCUMENT_BUCKET).file(doc.storage_path).getMetadata();
      if (metadata.contentType !== doc.content_type || Number(metadata.size) !== Number(doc.declared_size)) {
        res.status(422).json({ error: "Uploaded file does not match the declared file" }); return;
      }
      const updated = await pool.query(
        `UPDATE user_documents SET status='submitted', uploaded_at=now()
          WHERE id=$1 RETURNING id, document_type, status, uploaded_at`, [doc.id]
      );
      res.json({ document: updated.rows[0] });
    } catch (error) { next(error); }
  });

  app.get("/v1/documents", async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = await pool.query(
        `SELECT d.id, d.document_type, d.original_filename, d.status, d.created_at, d.uploaded_at,
                d.verified_at, d.expiry_date
           FROM user_documents d JOIN users u ON u.id=d.owner_user_id
          WHERE u.firebase_uid=$1 ORDER BY d.created_at DESC`, [req.user!.uid]
      );
      res.json({ documents: result.rows });
    } catch (error) { next(error); }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  });
  return app;
}
