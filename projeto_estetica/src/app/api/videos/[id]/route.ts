import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { formatInstagramEmbedUrl, isValidInstagramUrl } from '@/lib/instagram'
import { isValidString, isValidUrl, isValidOrder, isValidId } from '@/lib/validate'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidId(id)) {
    return Response.json({ success: false, error: 'Invalid id' }, { status: 400 })
  }
  const body = await request.json()
  const allowed = new Set(['title', 'instagramUrl', 'order', 'id'])
  const unknown = Object.keys(body).filter((k) => !allowed.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }
  const { title, instagramUrl, order: rawOrder } = body
  if (title !== undefined) {
    const c = isValidString(title, 2, 100)
    if (!c.valid) return Response.json({ success: false, error: `title ${c.error}` }, { status: 400 })
  }
  if (instagramUrl !== undefined) {
    const c = isValidUrl(instagramUrl, 500)
    if (!c.valid) return Response.json({ success: false, error: `instagramUrl ${c.error}` }, { status: 400 })
    if (!isValidInstagramUrl(instagramUrl)) {
      return Response.json({ success: false, error: 'instagramUrl must be an Instagram URL' }, { status: 400 })
    }
  }
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  try {
    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = String(title).trim()
    if (instagramUrl !== undefined) data.instagramUrl = formatInstagramEmbedUrl(instagramUrl)
    if (orderRes.parsed !== undefined) data.order = orderRes.parsed
    const item = await prisma.video.update({
      where: { id },
      data,
    })
    return Response.json({ success: true, item })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidId(id)) {
    return Response.json({ success: false, error: 'Invalid id' }, { status: 400 })
  }

  try {
    await prisma.video.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}
