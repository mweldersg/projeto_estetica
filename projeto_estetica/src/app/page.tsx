import LandingPage from '@/components/LandingPage'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [services, videos, reviews] = await Promise.all([
    prisma.service.findMany({ orderBy: { order: 'asc' } }),
    prisma.video.findMany({ orderBy: { order: 'asc' } }),
    prisma.review.findMany({ orderBy: { order: 'asc' } }),
  ])

  return <LandingPage services={services} videos={videos} reviews={reviews} />
}
