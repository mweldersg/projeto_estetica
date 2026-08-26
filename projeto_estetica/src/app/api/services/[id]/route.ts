import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidUrl, isValidOrder, isValidId, isValidOptionalString, isValidLineList } from '@/lib/validate'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidId(id)) {
    return Response.json({ success: false, error: 'Invalid id' }, { status: 400 })
  }
  const body = await request.json()
  const allowed = new Set([
    'title', 'description', 'image', 'value', 'order', 'id',
    'longDescription', 'duration', 'idealFor', 'features', 'includes',
  ])
  const unknown = Object.keys(body).filter((k) => !allowed.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }
  const { title, description, image, value, order: rawOrder, longDescription, duration, idealFor, features, includes } = body
  if (title !== undefined) {
    const c = isValidString(title, 2, 100)
    if (!c.valid) return Response.json({ success: false, error: `title ${c.error}` }, { status: 400 })
  }
  if (description !== undefined) {
    const c = isValidString(description, 10, 1000)
    if (!c.valid) return Response.json({ success: false, error: `description ${c.error}` }, { status: 400 })
  }
  if (image !== undefined) {
    const c = isValidUrl(image, 500)
    if (!c.valid) return Response.json({ success: false, error: `image ${c.error}` }, { status: 400 })
  }
  if (value !== undefined) {
    const c = isValidString(value, 1, 100)
    if (!c.valid) return Response.json({ success: false, error: `value ${c.error}` }, { status: 400 })
  }
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  // Optional "Saiba mais" modal fields (undefined = unchanged, ''/null = clear)
  const longDescRes = isValidOptionalString(longDescription, 1, 4000)
  if (!longDescRes.valid) return Response.json({ success: false, error: `longDescription ${longDescRes.error}` }, { status: 400 })
  const durationRes = isValidOptionalString(duration, 1, 200)
  if (!durationRes.valid) return Response.json({ success: false, error: `duration ${durationRes.error}` }, { status: 400 })
  const idealForRes = isValidOptionalString(idealFor, 1, 300)
  if (!idealForRes.valid) return Response.json({ success: false, error: `idealFor ${idealForRes.error}` }, { status: 400 })
  const featuresRes = isValidLineList(features)
  if (!featuresRes.valid) return Response.json({ success: false, error: `features ${featuresRes.error}` }, { status: 400 })
  const includesRes = isValidLineList(includes)
  if (!includesRes.valid) return Response.json({ success: false, error: `includes ${includesRes.error}` }, { status: 400 })

  try {
    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = String(title).trim()
    if (description !== undefined) data.description = String(description).trim()
    if (image !== undefined) data.image = String(image).trim()
    if (value !== undefined) data.value = String(value).trim()
    if (orderRes.parsed !== undefined) data.order = orderRes.parsed
    if (longDescRes.parsed !== undefined) data.longDescription = longDescRes.parsed
    if (durationRes.parsed !== undefined) data.duration = durationRes.parsed
    if (idealForRes.parsed !== undefined) data.idealFor = idealForRes.parsed
    if (featuresRes.parsed !== undefined) data.features = featuresRes.parsed
    if (includesRes.parsed !== undefined) data.includes = includesRes.parsed
    const item = await prisma.service.update({
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
    await prisma.service.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}
