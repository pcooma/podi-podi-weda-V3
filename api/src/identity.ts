export function normalizeUsername(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function safeFilename(value: string): string {
  const cleaned = value.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.slice(0, 120) || "document";
}

