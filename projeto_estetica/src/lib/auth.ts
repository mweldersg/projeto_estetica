import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      'Missing JWT_SECRET — set a cryptographically strong secret (at least 32 bytes / 64 hex characters). Generate with: openssl rand -hex 32'
    )
  }
  const trimmed = secret.trim()
  if (!trimmed) {
    throw new Error('JWT_SECRET is empty — set a cryptographically strong secret (at least 32 bytes / 64 hex characters).')
  }
  const byteLength = Buffer.byteLength(trimmed, 'utf8')
  if (byteLength < 32) {
    throw new Error(
      `JWT_SECRET too short (${byteLength} bytes) — must be at least 32 bytes (64 hex characters). Generate with: openssl rand -hex 32`
    )
  }
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length < 64) {
    throw new Error(
      'JWT_SECRET hex secret must be at least 64 hex characters (32 bytes). Generate with: openssl rand -hex 32'
    )
  }
  return trimmed
}

// Eager validation so the application fails fast at startup if misconfigured.
// In test runs we still want to be able to test the failure, so the check is
// performed lazily inside generateToken/verifyToken as well — this eager call
// only runs when the module is first imported outside of a unit-test that
// explicitly clears the env.
let JWT_SECRET_CACHE: string | null = null
function jwtSecret(): string {
  if (JWT_SECRET_CACHE) return JWT_SECRET_CACHE
  JWT_SECRET_CACHE = getJwtSecret()
  return JWT_SECRET_CACHE
}

export interface TokenPayload {
  userId: string
  phone: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as TokenPayload
  } catch {
    return null
  }
}

// Fail fast at startup — ensures the app does not boot with a missing/weak secret.
// Excluded for unit tests (NODE_ENV=test) where individual tests set JWT_SECRET.
if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  jwtSecret()
}

export async function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/token=([^;]+)/)
  if (!tokenMatch) return null

  const payload = verifyToken(tokenMatch[1])
  if (!payload) return null

  const admin = await prisma.admin.findUnique({
    where: { id: payload.userId }
  })
  return admin
}

export async function requireAdmin(request: Request) {
  return getUserFromRequest(request)
}
