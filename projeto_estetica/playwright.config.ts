import 'dotenv/config'
import { defineConfig } from '@playwright/test'

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || ''

if (!process.env.TEST_DATABASE_URL) {
  console.warn('TEST_DATABASE_URL not set — E2E will use DATABASE_URL (reseeded by tests)')
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
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
    },
  },
})
