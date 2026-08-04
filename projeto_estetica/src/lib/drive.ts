import { google } from 'googleapis'
import type { drive_v3, Auth } from 'googleapis'
import { Readable } from 'node:stream'

const SCOPES = ['https://www.googleapis.com/auth/drive.file']

export function isDriveUrl(url: string): boolean {
  return /drive\.google\.com|drive\.usercontent\.google\.com|googleusercontent\.com\/d\/|(^|\/)(api\/)?media\/[a-zA-Z0-9_-]+/.test(url)
}

export function extractFileId(url: string): string | null {
  const match =
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ??
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ??
    url.match(/(^|\/)(api\/)?media\/([a-zA-Z0-9_-]+)/)
  if (match && match[3]) return match[3]
  return match ? match[1] : null
}

export function getPublicUrl(fileId: string): string {
  return `/api/media/${fileId}`
}

export function getAuth(): Auth.OAuth2Client | Auth.JWT {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
    return oauth
  }
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })
}

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: getAuth() })
}

export async function getAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    const auth = getAuth() as Auth.OAuth2Client
    const { token } = await auth.getAccessToken()
    return token ?? null
  }
  const auth = getAuth() as Auth.JWT
  await auth.authorize()
  return auth.credentials.access_token ?? null
}

export function requireDriveEnv(): boolean {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_DRIVE_FOLDER_ID
    )
  }
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  )
}

async function ensurePublic(drive: drive_v3.Drive, fileId: string) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })
  } catch {
    // permission may already exist when the folder is shared publicly
  }
}

export interface MediaFile {
  name: string
  mimeType: string
  buffer: Buffer
}

export interface UploadResult {
  fileId: string
  url: string
}

export async function uploadMedia(
  media: MediaFile,
  existingUrl?: string
): Promise<UploadResult> {
  if (!requireDriveEnv()) {
    throw new Error('Google Drive is not configured')
  }

  const drive = getDriveClient()
  const existingFileId = existingUrl && isDriveUrl(existingUrl) ? extractFileId(existingUrl) : null

  if (existingFileId) {
    await drive.files.update({
      fileId: existingFileId,
      requestBody: { name: media.name },
      media: { mimeType: media.mimeType, body: Readable.from(media.buffer) },
      fields: 'id',
    })
    await ensurePublic(drive, existingFileId)
    return { fileId: existingFileId, url: getPublicUrl(existingFileId) }
  }

  const res = await drive.files.create({
    requestBody: {
      name: media.name,
      mimeType: media.mimeType,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string],
    },
    media: { mimeType: media.mimeType, body: Readable.from(media.buffer) },
    fields: 'id',
  })

  const fileId = res.data.id
  if (!fileId) throw new Error('Upload failed: no file id returned')

  await ensurePublic(drive, fileId)
  return { fileId, url: getPublicUrl(fileId) }
}

export async function deleteMediaByUrl(url: string) {
  if (!isDriveUrl(url)) return
  const fileId = extractFileId(url)
  if (!fileId) return
  try {
    await getDriveClient().files.delete({ fileId })
  } catch {
    // best effort: orphaned files are harmless
  }
}
