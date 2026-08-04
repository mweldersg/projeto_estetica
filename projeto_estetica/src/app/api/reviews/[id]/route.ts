import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { name, rating, text, order } = await request.json()

  try {
    const item = await prisma.review.update({
      where: { id },
      data: { name, rating: Number(rating) || 5, text, order: order ?? undefined }
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

  try {
    await prisma.review.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}
