# Google Drive-first backend

## Current status

The production pilot uses Firebase Authentication for sign-in and a Google Apps Script web app for the API. User records are stored as private per-user folders in the supplied Google Drive root; the master Google Sheet stores searchable indexes, jobs, bookings, documents, and audit events.

The older `api/` Cloud Run foundation remains in the repository as a future migration option. It is not required for the Drive-first pilot and must not be deployed alongside it without an explicit migration plan.

Use [GO_LIVE_GUIDE.md](GO_LIVE_GUIDE.md) for the complete setup, deployment, testing, and security checklist. The deployable Apps Script source is [gas_backend/Code.gs](gas_backend/Code.gs), with its manifest in [gas_backend/appsscript.json](gas_backend/appsscript.json).

## Legacy Cloud Run foundation

- Firebase email/password authentication with verification email.
- Firebase ID-token verification in the API.
- Permanent Firebase `uid` mapped to an internal UUID.
- Multi-role accounts (`client`, `provider`, `admin`, `superadmin`).
- Unique normalized usernames and non-unique display names.
- PostgreSQL/PostGIS identity, role, profile, document and audit tables.
- Provider profile save/load API.
- Private document metadata and 10-minute signed upload URLs.
- Allowed file types, declared-size limits and post-upload metadata checks.
- Cloud Run-compatible container.

## Google resources required

1. Create one Google Cloud project and attach Firebase to it.
2. Enable Firebase Authentication and the Email/Password provider.
3. Create a PostgreSQL Cloud SQL instance and database.
4. Apply `api/migrations/001_identity_and_documents.sql` using a migration identity that can create `pgcrypto` and `postgis` extensions.
5. Create a private Cloud Storage bucket. Do not enable public access for identity documents.
6. Give the Cloud Run service account only the bucket permissions required to create/read document objects and sign URLs, plus Cloud SQL client access.
7. Configure bucket CORS for the exact production and staging origins and methods `PUT` and `GET`.
8. Deploy the API container to Cloud Run with the variables shown in `api/.env.example`.
9. Replace the null value in `config.js` during deployment with the Firebase web configuration and Cloud Run API URL. Never put a service-account JSON key in frontend files.
10. Enable Firebase App Check after staging has been verified; enforce it only after the web client and API verification middleware are both deployed.

## Local checks

```sh
cd api
npm install
npm run check
```

The API also requires Application Default Credentials, a PostgreSQL database and a Cloud Storage bucket for an end-to-end local run. Use separate development, staging and production projects/buckets.

## Document storage paths

Files use the authenticated Firebase identity, never a name or email:

```text
users/{firebaseUid}/private/{documentType}/{documentId}-{safeFilename}
users/{firebaseUid}/public/portfolio/{documentId}-{safeFilename}
```

The bucket is still private. “Public” means eligible for a controlled public-profile delivery path later; it does not mean anonymous bucket access.

## Remaining production gates

- App Check verification and enforcement.
- Phone OTP/linking and duplicate verified-phone handling.
- Admin MFA and custom role claims.
- Malware scanning/quarantine before documents become reviewable.
- Admin-only signed document viewing with a sensitive-read audit entry.
- NIC encryption/hash and duplicate-identity workflow after legal retention requirements are approved.
- Data export/deletion workflow and retention policy.
- Database migration runner and staging integration tests.
- Jobs, matching, bookings, payment webhooks and commission ledger migration from demo storage.
