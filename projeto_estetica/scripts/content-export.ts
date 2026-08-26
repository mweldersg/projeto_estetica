// Pure helpers for building the public content export. Deliberately free of
// runtime dependencies (no prisma, no dotenv) so they can be unit-tested
// without a database.

export interface ContentCollections {
  services: unknown[]
  videos: unknown[]
  reviews: unknown[]
  faqs: unknown[]
}

export interface RawExport {
  admin?: unknown
  services?: unknown[]
  videos?: unknown[]
  reviews?: unknown[]
  faqs?: unknown[]
}

// Build a public-facing content export, always dropping the Admin model (and
// any other member-only data) from the output. Admin credentials are never
// required to recreate the site's public content, so they must never be written
// to current-data.json.
export function buildPublicContentExport(data: RawExport): ContentCollections {
  // "admin" is intentionally omitted from the result.
  return {
    services: normalizeArray(data.services),
    videos: normalizeArray(data.videos),
    reviews: normalizeArray(data.reviews),
    faqs: normalizeArray(data.faqs),
  }
}

// Recursively detect credential-like keys so an export regression fails loudly
// instead of silently shipping a password/hash to disk.
const SENSITIVE_KEYS = new Set([
  'admin',
  'password',
  'passwordhash',
  'hash',
  'secret',
  'secretkey',
  'clientsecret',
  'refreshtoken',
])

export function containsCredentialData(data: unknown): boolean {
  if (Array.isArray(data)) return data.some((item) => containsCredentialData(item))
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.trim().toLowerCase())) return true
      if (value && typeof value === 'object' && containsCredentialData(value)) return true
    }
  }
  return false
}

function normalizeArray(value: unknown[] | undefined): unknown[] {
  return Array.isArray(value) ? value : []
}