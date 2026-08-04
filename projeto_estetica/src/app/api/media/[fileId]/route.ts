import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, requireDriveEnv } from '@/lib/drive'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params

  if (!/^[a-zA-Z0-9_-]+$/.test(fileId) || !requireDriveEnv()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const token = await getAccessToken()
  if (!token) {
    return new NextResponse('Upstream error', { status: 502 })
  }

  const range = request.headers.get('range')
  const upstream = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(range ? { Range: range } : {}),
      },
    }
  )

  if (upstream.status === 404) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (!upstream.ok) {
    return new NextResponse('Upstream error', { status: 502 })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('Content-Length', contentLength)
  const contentRange = upstream.headers.get('content-range')
  if (contentRange) headers.set('Content-Range', contentRange)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'private, max-age=3600')

  return new NextResponse(upstream.body, { status: upstream.status, headers })
}
