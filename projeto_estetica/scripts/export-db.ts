import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs/promises'
import path from 'path'
import { buildPublicContentExport, containsCredentialData } from './content-export'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function exportDatabase() {
  try {
    console.log('Exporting database data...')

    // NOTE: The Admin model (and its password hash) is intentionally NOT
    // exported. buildPublicContentExport drops it, and containsCredentialData
    // below guards against any future regression leaking credentials.
    const [services, videos, reviews, faqs] = await Promise.all([
      prisma.service.findMany(),
      prisma.video.findMany(),
      prisma.review.findMany(),
      prisma.faq.findMany(),
    ])

    const content = buildPublicContentExport({ services, videos, reviews, faqs })
    const exportData = { ...content, exportedAt: new Date().toISOString(), version: 'current' }

    // Belt-and-suspenders: refuse to write anything that leaks credential data.
    if (containsCredentialData(exportData)) {
      throw new Error('Refusing to export: export contains credential-sensitive data')
    }

    const outputPath = path.join(process.cwd(), 'current-data.json')
    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2))

    console.log(`Database data exported to: ${outputPath}`)
    console.log('Export completed successfully!')

    return exportData
  } catch (error) {
    console.error('Error exporting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportDatabase()
