import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { requireDriveEnv, uploadMedia } from '@/lib/drive'


export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!requireDriveEnv()) {
    return Response.json({ success: false, error: 'Google Drive is not configured' }, { status: 500 })
  }

  const form = await request.formData()
  const file = form.get('file')
  const existingUrl = form.get('existingUrl')

  if (!(file instanceof File)) {
    return Response.json({ success: false, error: 'file is required' }, { status: 400 })
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return Response.json({ success: false, error: 'Only image and video files are allowed' }, { status: 400 })
  }

  try {
    const result = await uploadMedia(
      { name: file.name, mimeType: file.type, buffer: Buffer.from(await file.arrayBuffer()) },
      typeof existingUrl === 'string' && existingUrl ? existingUrl : undefined
    )
    return Response.json({ success: true, ...result }, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
