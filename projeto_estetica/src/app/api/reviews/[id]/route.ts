import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidRating, isValidOrder, isValidId } from '@/lib/validate'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidId(id)) {
    return Response.json({ success: false, error: 'Invalid id' }, { status: 400 })
  }
  const body = await request.json()
  const allowed = new Set(['name', 'rating', 'text', 'order', 'id'])
  const unknown = Object.keys(body).filter((k) => !allowed.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }
  const { name, rating, text, order: rawOrder } = body
  if (name !== undefined) {
    const c = isValidString(name, 2, 100)
    if (!c.valid) return Response.json({ success: false, error: `name ${c.error}` }, { status: 400 })
  }
  if (text !== undefined) {
    const c = isValidString(text, 10, 2000)
    if (!c.valid) return Response.json({ success: false, error: `text ${c.error}` }, { status: 400 })
  }
  let ratingRes: ReturnType<typeof isValidRating> | null = null
  if (rating !== undefined) {
    ratingRes = isValidRating(rating)
    if (!ratingRes.valid) return Response.json({ success: false, error: ratingRes.error }, { status: 400 })
  }
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  try {
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = String(name).trim()
    if (text !== undefined) data.text = String(text).trim()
    if (ratingRes?.parsed !== undefined) data.rating = ratingRes.parsed
    if (orderRes.parsed !== undefined) data.order = orderRes.parsed
    const item = await prisma.review.update({
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
    await prisma.review.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}
