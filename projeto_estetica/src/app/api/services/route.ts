import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isValidString, isValidUrl, isValidOrder, isValidOptionalString, isValidLineList } from '@/lib/validate'

export async function GET() {
  const items = await prisma.service.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

const ALLOWED_FIELDS = new Set([
  'title', 'description', 'image', 'value', 'order', 'id',
  'longDescription', 'duration', 'idealFor', 'features', 'includes',
])

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k))
  if (unknown.length > 0) {
    return Response.json({ success: false, error: `Unexpected fields: ${unknown.join(', ')}` }, { status: 400 })
  }

  const { title, description, image, value, order: rawOrder, longDescription, duration, idealFor, features, includes } = body

  const titleCheck = isValidString(title, 2, 100)
  if (!titleCheck.valid) return Response.json({ success: false, error: `title ${titleCheck.error}` }, { status: 400 })
  const descCheck = isValidString(description, 10, 1000)
  if (!descCheck.valid) return Response.json({ success: false, error: `description ${descCheck.error}` }, { status: 400 })
  const imageCheck = isValidUrl(image, 500)
  if (!imageCheck.valid) return Response.json({ success: false, error: `image ${imageCheck.error}` }, { status: 400 })
  const valueCheck = isValidString(value, 1, 100)
  if (!valueCheck.valid) return Response.json({ success: false, error: `value ${valueCheck.error}` }, { status: 400 })
  const orderRes = isValidOrder(rawOrder)
  if (!orderRes.valid) return Response.json({ success: false, error: orderRes.error }, { status: 400 })

  // Optional "Saiba mais" modal fields
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

  const item = await prisma.service.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      value: value.trim(),
      order: orderRes.parsed ?? 0,
      longDescription: longDescRes.parsed ?? null,
      duration: durationRes.parsed ?? null,
      idealFor: idealForRes.parsed ?? null,
      features: featuresRes.parsed ?? null,
      includes: includesRes.parsed ?? null,
    }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
