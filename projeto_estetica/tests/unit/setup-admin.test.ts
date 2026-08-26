import 'dotenv/config'
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const TEST_DB = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || ''
const STRONG_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

function runSetupAdmin(inputs: string[], extraEnv: Record<string, string> = {}) {
  return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve) => {
    const child = spawn('npx', ['tsx', 'scripts/setup-admin.ts'], {
      env: { ...process.env, DATABASE_URL: TEST_DB, JWT_SECRET: STRONG_SECRET, ...extraEnv },
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))

    // Feed inputs with fixed delays — promptHidden uses raw mode but still reads stdin
    setTimeout(() => {
      if (inputs[0] !== undefined) child.stdin.write(inputs[0] + '\n')
    }, 400)
    setTimeout(() => {
      if (inputs[1] !== undefined) {
        child.stdin.write(inputs[1] + '\n')
        child.stdin.end()
      } else {
        child.stdin.end()
      }
    }, 900)

    child.on('close', (code) => resolve({ stdout, stderr, code }))
    child.on('error', (err) => resolve({ stdout, stderr: String(err), code: 1 }))
    // Timeout guard
    setTimeout(() => {
      try { child.kill() } catch {}
      resolve({ stdout, stderr: stdout + stderr + ' timeout', code: 1 })
    }, 10000)
  })
}

describe('setup-admin command', () => {
  let prisma: PrismaClient

  before(async () => {
    if (!TEST_DB) throw new Error('No DATABASE_URL for setup-admin tests')
    const adapter = new PrismaPg({ connectionString: TEST_DB })
    prisma = new PrismaClient({ adapter })
    // Ensure clean slate for these tests — delete existing admins
    await prisma.admin.deleteMany({})
  })

  after(async () => {
    await prisma.$disconnect()
  })

  test('requires admin phone and password', async () => {
    // Missing phone (empty first input)
    const res1 = await runSetupAdmin(['', 'ValidPass123'])
    assert.notEqual(res1.code, 0, 'should fail when phone missing')
    assert.match(res1.stderr + res1.stdout, /phone is required|Invalid phone/i)

    // Missing password (empty second input)
    const res2 = await runSetupAdmin(['19998740950', ''])
    assert.notEqual(res2.code, 0, 'should fail when password missing')
    assert.match(res2.stderr + res2.stdout, /password is required/i)

    // Short password
    const res3 = await runSetupAdmin(['19998740950', 'short'])
    assert.notEqual(res3.code, 0, 'should fail when password too short')
    assert.match(res3.stderr + res3.stdout, /too short/i)
  })

  test('creates admin with bcrypt hash and does not expose password', async () => {
    // Clean again
    await prisma.admin.deleteMany({})
    const phone = '19998740950'
    const password = 'SuperSecret123!'
    const res = await runSetupAdmin([phone, password])
    // Should succeed
    assert.equal(res.code, 0, `setup-admin should succeed, got stdout:${res.stdout} stderr:${res.stderr}`)
    assert.match(res.stdout, /Admin account created/)
    // Must NOT contain password or hash
    assert.ok(!res.stdout.includes(password), 'stdout must not contain password')
    assert.ok(!res.stderr.includes(password), 'stderr must not contain password')
    assert.ok(!res.stdout.includes('$2b$'), 'stdout must not contain hash')
    assert.ok(!res.stderr.includes('$2b$'), 'stderr must not contain hash')

    // Verify DB
    const admin = await prisma.admin.findUnique({ where: { phone } })
    assert.ok(admin, 'admin should exist')
    assert.ok(admin!.password.startsWith('$2b$'), 'password should be bcrypt hash')
    assert.ok(await bcrypt.compare(password, admin!.password), 'hash should verify')
    assert.ok(!(await bcrypt.compare('wrong', admin!.password)), 'wrong password should not verify')
  })

  test('rejects second run when admin already exists', async () => {
    // Admin already exists from previous test
    const res = await runSetupAdmin(['11999999999', 'AnotherPass123'])
    assert.notEqual(res.code, 0, 'second setup should fail')
    assert.match(res.stderr + res.stdout, /already exists/i)
    const count = await prisma.admin.count()
    assert.equal(count, 1, 'should still have only one admin')
  })

  test('no default password "password" works after fresh seed (no admin)', async () => {
    // Delete admin to simulate "No admin exists → no default admin"
    await prisma.admin.deleteMany({})
    const admin = await prisma.admin.findUnique({ where: { phone: '19998740950' } })
    assert.equal(admin, null, 'no admin should exist after delete')
    // Simulate that seed does NOT create admin — verify seed file has no admin logic
    const fs = await import('node:fs')
    const seedContent = fs.readFileSync('prisma/seed.ts', 'utf8')
    assert.ok(!seedContent.includes('ADMIN_PASSWORD'), 'seed should not contain ADMIN_PASSWORD')
    assert.ok(!seedContent.includes('prisma.admin'), 'seed should not create admin')
    // Restore test admin for subsequent e2e runs
    const hashed = await bcrypt.hash('TestAdmin123!', 10)
    await prisma.admin.create({ data: { phone: '19998740950', password: hashed } })
  })
})
