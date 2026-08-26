import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidOrder, isValidId } from '@/lib/validate'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidId(id)) {
    return Response.json({ success: false, error: 'Invalid id' }, { status: 400 })
  }
  const body = await request.json()
  const allowed = new Set(['question', 'answer', 'order', 'id'])
  const unknown = Object.keys(body).filter((k) => !allowed.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }
  const { question, answer, order: rawOrder } = body
  if (question !== undefined) {
    const c = isValidString(question, 5, 200)
    if (!c.valid) return Response.json({ success: false, error: `question ${c.error}` }, { status: 400 })
  }
  if (answer !== undefined) {
    const c = isValidString(answer, 10, 2000)
    if (!c.valid) return Response.json({ success: false, error: `answer ${c.error}` }, { status: 400 })
  }
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  try {
    const data: Record<string, unknown> = {}
    if (question !== undefined) data.question = String(question).trim()
    if (answer !== undefined) data.answer = String(answer).trim()
    if (orderRes.parsed !== undefined) data.order = orderRes.parsed
    const item = await prisma.faq.update({
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
    await prisma.faq.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}