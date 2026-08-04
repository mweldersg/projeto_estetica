import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const ADMIN_PHONE = process.env.ADMIN_PHONE || '19998740950'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    const cleanPhone = String(phone || '').replace(/\D/g, '')

    if (cleanPhone !== ADMIN_PHONE) {
      return Response.json(
        { success: false, error: 'Acesso restrito' },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { phone: cleanPhone }
    })

    if (!admin) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(String(password || ''), admin.password)

    if (!valid) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: admin.id,
      phone: admin.phone,
      role: 'admin'
    })

    return new Response(
      JSON.stringify({ success: true, user: { ...admin, password: undefined } }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
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
