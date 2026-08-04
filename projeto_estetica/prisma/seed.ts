import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { formatInstagramEmbedUrl } from '../src/lib/instagram'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_PHONE = process.env.ADMIN_PHONE || '19998740950'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'

async function main() {
  console.log('Seeding database with current data...')

  // Lê o current-data.json de forma segura com tipagem explícita
  let adminData: {
    services: Array<{ id: string; title: string; description: string; image: string; value: number }>
    videos: Array<{ id: string; title: string; instagramUrl: string }>
    reviews: Array<{ id: string; name: string; rating: number; text: string }>
  } = { services: [], videos: [], reviews: [] }

  const jsonPath = path.join(__dirname, '../current-data.json')
  
  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8')
    adminData = JSON.parse(fileContent)
    console.log('Loaded data from current-data.json successfully.')
  } else {
    console.log('current-data.json not found, skipping data arrays seed.')
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  await prisma.admin.upsert({
    where: { phone: ADMIN_PHONE },
    update: { password: hashedPassword },
    create: { phone: ADMIN_PHONE, password: hashedPassword },
  })

  console.log('Creating/updating services...')
  for (const [index, service] of adminData.services.entries()) {
    await prisma.service.upsert({
      where: { id: service.id },
      create: { ...service, order: index },
      update: {
        title: service.title,
        description: service.description,
        image: service.image,
        value: service.value,
        order: index,
      },
    })
  }

  console.log('Creating/updating videos...')
  for (const [index, video] of adminData.videos.entries()) {
    await prisma.video.upsert({
      where: { id: video.id },
      create: { ...video, order: index },
      update: { title: video.title, instagramUrl: video.instagramUrl, order: index },
    })
  }

  console.log('Creating/updating reviews...')
  for (const [index, review] of adminData.reviews.entries()) {
    await prisma.review.upsert({
      where: { id: review.id },
      create: { ...review, order: index },
      update: {
        name: review.name,
        rating: review.rating,
        text: review.text,
        order: index,
      },
    })
  }

  console.log('Seed complete - database synchronized with current state!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
