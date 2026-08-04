import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params

  // Google Drive integration has been removed
  // Media files are no longer served from Google Drive
  return new NextResponse('Not found', { status: 404 })
}
