import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { getClientIp, isRateLimited, recordFailedAttempt, clearAttemptsFor } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    const cleanPhone = String(phone || '').replace(/\D/g, '')
    const ip = getClientIp(request)

    // Rate limit check before any DB work — same response for IP or phone
    const { limited, retryAfter } = await isRateLimited(ip, cleanPhone)
    if (limited) {
      return Response.json(
        { success: false, error: 'Too many attempts, please try again later' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    if (!cleanPhone) {
      await recordFailedAttempt(ip, cleanPhone)
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { phone: cleanPhone }
    })

    if (!admin) {
      await recordFailedAttempt(ip, cleanPhone)
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(String(password || ''), admin.password)

    if (!valid) {
      await recordFailedAttempt(ip, cleanPhone)
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Success — clear rate limit for this IP/phone
    await clearAttemptsFor(cleanPhone, ip)

    const token = generateToken({
      userId: admin.id,
      phone: admin.phone,
      role: 'admin'
    })

    const isProd = process.env.NODE_ENV === 'production'
    const secureFlag = isProd ? '; Secure' : ''
    return new Response(
      JSON.stringify({ success: true, user: { ...admin, password: undefined } }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${7 * 24 * 60 * 60}`
        }
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
