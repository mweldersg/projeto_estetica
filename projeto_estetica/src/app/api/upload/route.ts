import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'


export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Google Drive integration has been removed as part of the architectural shift
  // File uploads are no longer supported - only text-based content can be managed
  return Response.json(
    { success: false, error: 'File uploads are not supported in the current architecture' },
    { status: 501 }
  )
}
