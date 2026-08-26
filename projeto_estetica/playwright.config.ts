import 'dotenv/config'
import { defineConfig } from '@playwright/test'

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || ''
const testJwtSecret = process.env.JWT_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

if (!process.env.TEST_DATABASE_URL) {
  console.warn('TEST_DATABASE_URL not set — E2E will use DATABASE_URL (reseeded by tests)')
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = testJwtSecret
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  // Single worker keeps the suite deterministic: the rate-limit tests share the
  // real 127.0.0.1 limiter bucket (client-supplied forwarding headers are
  // intentionally ignored by production code), so parallel workers could clear
  // each other's LoginAttempt state mid-test or 429 another worker's login.
  workers: 1,
  retries: 0,
  globalSetup: './tests/e2e/globalSetup.ts',
  use: {
    baseURL: 'http://localhost:3456',
  },
  webServer: {
    command:
      'sh -c "for i in 1 2 3 4 5 6; do npx prisma migrate deploy && break; echo migrate retry $i; sleep 5; done" && npm run seed && npm run dev -- -p 3456',
    url: 'http://localhost:3456',
    reuseExistingServer: true,
    timeout: 180000,
    env: {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: testJwtSecret,
    },
  },
})
