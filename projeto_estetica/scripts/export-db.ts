import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs/promises'
import path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function exportDatabase() {
  try {
    console.log('Exporting database data...')

    const [admin, services, videos, reviews, faqs] = await Promise.all([
      prisma.admin.findMany(),
      prisma.service.findMany(),
      prisma.video.findMany(),
      prisma.review.findMany(),
      prisma.faq.findMany(),
    ])

    const exportData = {
      admin,
      services,
      videos,
      reviews,
      faqs,
      exportedAt: new Date().toISOString(),
      version: 'current'
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
