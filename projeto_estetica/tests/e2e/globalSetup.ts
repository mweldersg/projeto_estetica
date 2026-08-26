import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

export const TEST_ADMIN_PHONE = '19998740950'
export const TEST_ADMIN_PASSWORD = 'TestAdmin123!'
export const TEST_JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

async function globalSetup() {
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  if (!databaseUrl) {
    console.warn('No DATABASE_URL for globalSetup — skipping admin creation')
    return
  }

  // Ensure JWT_SECRET meets 32-byte requirement for the server
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = TEST_JWT_SECRET
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    // Clear old rate-limit entries for a clean test run
    try { await prisma.loginAttempt.deleteMany({}) } catch {}
    // Ensure admin exists for E2E — direct DB setup, not via interactive setup-admin
    const cleanPhone = TEST_ADMIN_PHONE.replace(/\D/g, '')
    const existing = await prisma.admin.findUnique({ where: { phone: cleanPhone } })
    if (!existing) {
      const hashed = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10)
      await prisma.admin.create({ data: { phone: cleanPhone, password: hashed } })
      console.log(`[globalSetup] Test admin created: ${cleanPhone}`)
    } else {
      // Ensure password is the expected test password (reseed may have left old hash)
      const valid = await bcrypt.compare(TEST_ADMIN_PASSWORD, existing.password)
      if (!valid) {
        const hashed = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10)
        await prisma.admin.update({ where: { phone: cleanPhone }, data: { password: hashed } })
        console.log(`[globalSetup] Test admin password reset: ${cleanPhone}`)
      }
    }
  } catch (e) {
    console.error('[globalSetup] Failed to create test admin', e)
    throw e
  } finally {
    await prisma.$disconnect()
  }
}

export default globalSetup
