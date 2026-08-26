import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidOrder } from '@/lib/validate'

export async function GET() {
  const items = await prisma.faq.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

const ALLOWED_FIELDS = new Set(['question', 'answer', 'order', 'id'])

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }

  const { question, answer, order: rawOrder } = body
  const qCheck = isValidString(question, 5, 200)
  if (!qCheck.valid) return Response.json({ success: false, error: `question ${qCheck.error}` }, { status: 400 })
  const aCheck = isValidString(answer, 10, 2000)
  if (!aCheck.valid) return Response.json({ success: false, error: `answer ${aCheck.error}` }, { status: 400 })
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  const item = await prisma.faq.create({
    data: { question: question.trim(), answer: answer.trim(), order: orderRes.parsed ?? 0 }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
