import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'garage765-secret-key-2024'

export interface TokenPayload {
  userId: string
  phone: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
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
