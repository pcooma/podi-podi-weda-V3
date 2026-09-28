import { z } from "zod";

export const providerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(150),
  username: z.string().trim().min(3).max(30),
  phone: z.string().regex(/^07\d{8}$/),
  district: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(80),
  skills: z.array(z.string().trim().min(1).max(100)).max(30),
  experienceYears: z.number().int().min(0).max(80),
  evidenceSummary: z.string().trim().max(2000).default(""),
  preferredLanguage: z.enum(["si", "ta", "en"]).default("si")
});

export const uploadRequestSchema = z.object({
  type: z.enum(["nic_front", "nic_back", "selfie", "certificate", "business_registration", "licence", "reference", "portfolio"]),
  filename: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  size: z.number().int().positive(),
  consentVersion: z.string().trim().min(1).max(30)
});

