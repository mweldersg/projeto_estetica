import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Test-only isolation helper. The rate-limit E2E tests intentionally exhaust
// the real 127.0.0.1 rate-limit bucket (getClientIp() correctly ignores
// spoofable headers, so every local request shares that bucket). To keep the
// Playwright suite deterministic in a single run we reset the LoginAttempt
// table around the rate-limit tests so later tests authenticate normally.
//
// This does NOT touch the production rate-limiting logic — it only clears the
// test database's LoginAttempt rows, using the same TEST_DATABASE_URL /
// DATABASE_URL resolution as the globalSetup and the dev server.
export async function clearLoginAttempts(): Promise<void> {
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || ''
  if (!databaseUrl) return
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })
  try {
    await prisma.loginAttempt.deleteMany({})
  } finally {
    await prisma.$disconnect()
  }
}