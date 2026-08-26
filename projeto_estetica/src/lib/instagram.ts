// Returns true only for the Instagram domain and its legitimate subdomains
// (e.g. instagram.com, www.instagram.com, *.instagram.com).
//
// This rejects lookalike / attacker-controlled hosts such as:
//   - evilinstagram.com       (no dot immediately before "instagram.com")
//   - anythinginstagram.com   (no dot immediately before "instagram.com")
//   - instagram.com.evil.com  (ends with "evil.com", not ".instagram.com")
//   - other unrelated domains
export function isInstagramHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '')
  if (!host) return false
  return host === 'instagram.com' || host.endsWith('.instagram.com')
}

// Validates a full URL: must be http(s) AND on the Instagram domain/subdomains.
export function isValidInstagramUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    return isInstagramHost(url.hostname)
  } catch {
    return false
  }
}

export function formatInstagramEmbedUrl(rawUrl: string): string {
  const processed = rawUrl.trim()
    .split('?')[0]
    .replace(/\/+$/, '')
    .replace(/\/reel\//, '/p/')

  return processed.endsWith('/embed/') ? processed : `${processed}/embed/`
}
