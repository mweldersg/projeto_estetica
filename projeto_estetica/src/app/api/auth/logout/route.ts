import { NextResponse } from 'next/server'

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production'
  const secureFlag = isProd ? '; Secure' : ''
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': `token=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=0`
    }
  })
}
