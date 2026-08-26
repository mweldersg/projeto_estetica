import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidRating, isValidOrder } from '@/lib/validate'

export async function GET() {
  const items = await prisma.review.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

const ALLOWED_FIELDS = new Set(['name', 'rating', 'text', 'order', 'id'])

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }

  const { name, rating, text, order: rawOrder } = body
  const nameCheck = isValidString(name, 2, 100)
  if (!nameCheck.valid) return Response.json({ success: false, error: `name ${nameCheck.error}` }, { status: 400 })
  const textCheck = isValidString(text, 10, 2000)
  if (!textCheck.valid) return Response.json({ success: false, error: `text ${textCheck.error}` }, { status: 400 })
  const ratingRes = isValidRating(rating)
  if (!ratingRes.valid) return Response.json({ success: false, error: ratingRes.error }, { status: 400 })
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  const item = await prisma.review.create({
    data: { name: String(name).trim(), rating: ratingRes.parsed!, text: String(text).trim(), order: orderRes.parsed ?? 0 }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
