import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { services, videos, reviews } from '../src/lib/mock-data'
import { formatInstagramEmbedUrl } from '../src/lib/instagram'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_PHONE = process.env.ADMIN_PHONE || '19998740950'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'

async function main() {
  console.log('Seeding database...')
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  await prisma.admin.upsert({
    where: { phone: ADMIN_PHONE },
    update: { password: hashedPassword },
    create: { phone: ADMIN_PHONE, password: hashedPassword },
  })

  for (const [index, service] of services.entries()) {
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

  for (const [index, video] of videos.entries()) {
    const instagramUrl = formatInstagramEmbedUrl(video.instagramUrl)
    await prisma.video.upsert({
      where: { id: video.id },
      create: { id: video.id, title: video.title, instagramUrl, order: index },
      update: { title: video.title, instagramUrl, order: index },
    })
  }

  for (const [index, review] of reviews.entries()) {
    await prisma.review.upsert({
      where: { id: review.id },
      create: { ...review, order: index },
      update: {
        name: review.name,
        rating: review.rating,
        text: review.text,
        image: review.image ?? null,
        order: index,
      },
    })
  }

  console.log('Seed complete')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())