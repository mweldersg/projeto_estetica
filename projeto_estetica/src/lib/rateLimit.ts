import { prisma } from './prisma'

// Production-safe DB-backed rate limiting for serverless
// Limits are per 15-minute window, not permanent lock

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS_IP = 10
const MAX_ATTEMPTS_PHONE = 5

function windowStart(): Date {
  return new Date(Date.now() - WINDOW_MS)
}

export function normalizePhoneForLimit(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Handle Brazilian numbers with country code +55: 5519998740950 -> 19998740950
  if (digits.length > 11 && digits.startsWith('55')) return digits.slice(-11)
  return digits
}

export function getClientIp(request: Request): string {
  // ONLY request.ip (NextRequest.ip) is trusted. It is derived by the platform
  // / runtime from the actual TCP connection (and, on Vercel / Next.js, the real
  // client IP after the trusted proxy layer sanitizes spoofed headers). It is
  // not directly settable by the request body or headers.
  //
  // x-real-ip and x-forwarded-for are ordinary client-controlled headers. A
  // direct client can set either to any value, and they are only safe to trust
  // when a reverse proxy is *guaranteed* to overwrite them. No such proxy is
  // configured in this deployment, so using them as IP rate-limit keys would let
  // an attacker rotate arbitrary values to create unbounded buckets and bypass
  // the rate limit. They are therefore NOT consulted.
  const maybeIp = (request as unknown as { ip?: string }).ip
  if (maybeIp && typeof maybeIp === 'string' && maybeIp.trim()) {
    return maybeIp.trim()
  }

  // No trusted client IP is available. Collapse into ONE shared bucket instead
  // of trusting client-controlled headers: all unverified requests share the
  // same 'unknown' key, so an attacker cannot rotate spoofed IPs to bypass the
  // per-IP rate limit. (On Vercel, request.ip is always populated, so this only
  // matters for misconfigured/self-hosted deployments — and stays safe.)
  return 'unknown'
}

export async function isRateLimited(ip: string, phone: string): Promise<{ limited: boolean; retryAfter: number }> {
  const since = windowStart()
  const normalizedPhone = normalizePhoneForLimit(phone)
  // Check both limits in parallel
  const [ipCount, phoneCount] = await Promise.all([
    prisma.loginAttempt.count({ where: { ip, createdAt: { gte: since } } }),
    normalizedPhone ? prisma.loginAttempt.count({ where: { phone: normalizedPhone, createdAt: { gte: since } } }) : Promise.resolve(0),
  ])

  if (ipCount >= MAX_ATTEMPTS_IP || phoneCount >= MAX_ATTEMPTS_PHONE) {
    // Find oldest attempt in window to calculate retryAfter
    const oldest = await prisma.loginAttempt.findFirst({
      where: { OR: [{ ip }, { phone: normalizedPhone }] , createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })
    const retryAfter = oldest ? Math.ceil((oldest.createdAt.getTime() + WINDOW_MS - Date.now()) / 1000) : 60
    return { limited: true, retryAfter: Math.max(retryAfter, 1) }
  }
  return { limited: false, retryAfter: 0 }
}

export async function recordFailedAttempt(ip: string, phone: string): Promise<void> {
  try {
    const normalizedPhone = normalizePhoneForLimit(phone)
    await prisma.loginAttempt.create({ data: { ip, phone: normalizedPhone || 'unknown' } })
    // Cleanup old entries (older than 1 hour) opportunistically — low cost, keep table small
    const cutoff = new Date(Date.now() - 60 * 60 * 1000)
    // Fire-and-forget, don't await to not block login response
    prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } }).catch(() => {})
  } catch {
    // Ignore DB errors for rate limiting — don't block login
  }
}

export async function clearAttemptsFor(phone: string, ip?: string): Promise<void> {
  try {
    const normalizedPhone = normalizePhoneForLimit(phone)
    if (ip) await prisma.loginAttempt.deleteMany({ where: { OR: [{ phone: normalizedPhone }, { ip }] } })
    else await prisma.loginAttempt.deleteMany({ where: { phone: normalizedPhone } })
  } catch {}
}

// For tests: clear all
export async function clearAllAttempts(): Promise<void> {
  try { await prisma.loginAttempt.deleteMany({}) } catch {}
}
