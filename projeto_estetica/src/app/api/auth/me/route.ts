import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return Response.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const safeUser = { ...user, password: undefined, role: 'admin' }

  return Response.json({ success: true, user: safeUser })
}
