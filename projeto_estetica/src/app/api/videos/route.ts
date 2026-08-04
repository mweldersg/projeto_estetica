import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { formatInstagramEmbedUrl } from '@/lib/instagram'

export async function GET() {
  const items = await prisma.video.findMany({ orderBy: { order: 'asc' } })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { title, instagramUrl, order } = await request.json()

  if (!title || !instagramUrl) {
    return Response.json(
      { success: false, error: 'All fields are required' },
      { status: 400 }
    )
  }

  const item = await prisma.video.create({
    data: { title, instagramUrl: formatInstagramEmbedUrl(instagramUrl), order: order ?? 0 }
  })

  return Response.json({ success: true, item }, { status: 201 })
}
