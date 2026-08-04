import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const items = await prisma.review.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { name, rating, text, image, order } = await request.json()

  if (!name || !text) {
    return Response.json(
      { success: false, error: 'All fields are required' },
      { status: 400 }
    )
  }

  const item = await prisma.review.create({
    data: { name, rating: Number(rating) || 5, text, image: image || null, order: order ?? 0 }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
