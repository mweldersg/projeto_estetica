import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return Response.json(
        { success: false, error: 'Old password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return Response.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const valid = user.password
      ? await bcrypt.compare(oldPassword, user.password)
      : false

    if (!valid) {
      return Response.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.admin.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return Response.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
