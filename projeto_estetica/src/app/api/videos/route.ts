import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { formatInstagramEmbedUrl, isValidInstagramUrl } from '@/lib/instagram'
import { isValidString, isValidUrl, isValidOrder } from '@/lib/validate'

export async function GET() {
  const items = await prisma.video.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

const ALLOWED_FIELDS = new Set(['title', 'instagramUrl', 'order', 'id'])

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }

  const { title, instagramUrl, order: rawOrder } = body
  const titleCheck = isValidString(title, 2, 100)
  if (!titleCheck.valid) return Response.json({ success: false, error: `title ${titleCheck.error}` }, { status: 400 })
  const urlCheck = isValidUrl(instagramUrl, 500)
  if (!urlCheck.valid) return Response.json({ success: false, error: `instagramUrl ${urlCheck.error}` }, { status: 400 })
  if (!isValidInstagramUrl(instagramUrl)) {
    return Response.json({ success: false, error: 'instagramUrl must be an Instagram URL' }, { status: 400 })
  }
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  const item = await prisma.video.create({
    data: { title: title.trim(), instagramUrl: formatInstagramEmbedUrl(instagramUrl), order: orderRes.parsed ?? 0 }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
