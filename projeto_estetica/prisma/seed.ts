import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type CurrentData = {
  services: Array<{ id: string; title: string; description: string; image: string; value: string; order?: number }>
  videos: Array<{ id: string; title: string; instagramUrl: string; order?: number }>
  reviews: Array<{ id: string; name: string; rating: number; text: string; order?: number }>
  faqs: Array<{ id: string; question: string; answer: string; order?: number }>
}

async function main() {
  console.log('Seeding database with current data...')

  const adminData: CurrentData = { services: [], videos: [], reviews: [], faqs: [] }

  const jsonPath = path.join(__dirname, '../current-data.json')

  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8')
    const parsed = JSON.parse(fileContent)
    adminData.services = parsed.services ?? []
    adminData.videos = parsed.videos ?? []
    adminData.reviews = parsed.reviews ?? []
    adminData.faqs = parsed.faqs ?? []
    console.log('Loaded data from current-data.json successfully.')
  } else {
    console.log('current-data.json not found, skipping data arrays seed.')
  }

  console.log('Creating/updating services...')
  for (const [index, service] of adminData.services.entries()) {
    await prisma.service.upsert({
      where: { id: service.id },
      create: { ...service, order: service.order ?? index },
      update: {
        title: service.title,
        description: service.description,
        image: service.image,
        value: service.value,
        order: service.order ?? index,
      },
    })
  }

  console.log('Creating/updating videos...')
  for (const [index, video] of adminData.videos.entries()) {
    await prisma.video.upsert({
      where: { id: video.id },
      create: { ...video, order: video.order ?? index },
      update: { title: video.title, instagramUrl: video.instagramUrl, order: video.order ?? index },
    })
  }

  console.log('Creating/updating reviews...')
  for (const [index, review] of adminData.reviews.entries()) {
    await prisma.review.upsert({
      where: { id: review.id },
      create: { ...review, order: review.order ?? index },
      update: {
        name: review.name,
        rating: review.rating,
        text: review.text,
        order: review.order ?? index,
      },
    })
  }

  if (adminData.faqs.length > 0) {
    console.log('Creating/updating faqs...')
    for (const [index, faq] of adminData.faqs.entries()) {
      await prisma.faq.upsert({
        where: { id: faq.id },
        create: { ...faq, order: faq.order ?? index },
        update: {
          question: faq.question,
          answer: faq.answer,
          order: faq.order ?? index,
        },
      })
    }
  }

  console.log('Seed complete - database synchronized with current state!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
