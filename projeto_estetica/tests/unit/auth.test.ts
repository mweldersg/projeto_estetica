import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import jwt from 'jsonwebtoken'

const STRONG_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
const OLD_SECRET = 'garage765-secret-key-2024'

function runWithEnv(env: Record<string, string | undefined>, code: string) {
  const result = spawnSync('node', ['--import', 'tsx', '-e', code], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  })
  return result
}

describe('JWT_SECRET hardening', () => {
  test('fails safely when JWT_SECRET is missing', () => {
    const code = `
      delete process.env.JWT_SECRET;
      // Force re-evaluation by clearing cache — import fresh file
      // src/lib/auth.ts throws at import-time via getJwtSecret()
      try {
        const m = await import('./src/lib/auth.ts');
        // Trigger getJwtSecret via generateToken
        m.default.generateToken({userId:'x', phone:'y', role:'admin'});
        console.log('no-throw');
      } catch (e) {
        console.log('threw:' + e.message);
        process.exit(0);
      }
      process.exit(1);
    `
    const res = runWithEnv({ JWT_SECRET: '' }, code)
    const out = res.stdout + res.stderr
    assert.match(out, /Missing JWT_SECRET/)
  })

  test('fails when JWT_SECRET is too short', () => {
    const code = `
      const m = await import('./src/lib/auth.ts');
      // call generate to trigger getJwtSecret
      try { m.default.generateToken({userId:'x', phone:'y', role:'admin'}); console.log('no-throw'); process.exit(1);} catch(e){ console.log('threw:'+e.message); process.exit(0); }
    `
    const res = runWithEnv({ JWT_SECRET: 'short' }, code)
    const out = res.stdout + res.stderr
    assert.match(out, /too short/)
  })

  test('fails when JWT_SECRET hex is <64 chars', () => {
    const code = `
      const m = await import('./src/lib/auth.ts');
      try { m.default.generateToken({userId:'x', phone:'y', role:'admin'}); console.log('no-throw'); process.exit(1);} catch(e){ console.log('threw:'+e.message); process.exit(0); }
    `
    const res = runWithEnv({ JWT_SECRET: '0123456789abcdef' }, code)
    const out = res.stdout + res.stderr
    assert.match(out, /too short|hex secret must be at least 64/)
  })

  test('accepts strong secret and generates/verifies token', async () => {
    process.env.JWT_SECRET = STRONG_SECRET
    // Need to reimport after setting env — use dynamic import with cache bust via query
    const mod = await import(`../../src/lib/auth.ts?strong-${Date.now()}`)
    const auth = mod.default ?? mod
    const payload = { userId: 'test-id', phone: '19998740950', role: 'admin' }
    const token = auth.generateToken(payload)
    assert.ok(typeof token === 'string' && token.split('.').length === 3)
    const verified = auth.verifyToken(token)
    assert.ok(verified)
    assert.equal(verified?.userId, payload.userId)
    assert.equal(verified?.phone, payload.phone)
  })

  test('rejects tokens signed with old hardcoded secret', async () => {
    process.env.JWT_SECRET = STRONG_SECRET
    const mod = await import(`../../src/lib/auth.ts?old-${Date.now()}`)
    const auth = mod.default ?? mod
    const payload = { userId: 'attacker', phone: '19998740950', role: 'admin' }
    const forged = jwt.sign(payload, OLD_SECRET, { expiresIn: '7d' })
    const verified = auth.verifyToken(forged)
    assert.equal(verified, null, 'old secret token must be rejected')
  })

  test('legitimately signed tokens continue to work', async () => {
    process.env.JWT_SECRET = STRONG_SECRET
    const mod = await import(`../../src/lib/auth.ts?legit-${Date.now()}`)
    const auth = mod.default ?? mod
    const payload = { userId: 'legit-id', phone: '19998740950', role: 'admin' }
    const token = auth.generateToken(payload)
    const verified = auth.verifyToken(token)
    assert.ok(verified)
    assert.equal(verified?.userId, 'legit-id')
    // Tampered token fails
    const tampered = token.slice(0, -1) + 'a'
    assert.equal(auth.verifyToken(tampered), null)
  })

  test('no default JWT secret can be used (old secret not accepted as env)', () => {
    const code = `
      const m = await import('./src/lib/auth.ts');
      try { m.default.generateToken({userId:'x', phone:'y', role:'admin'}); console.log('no-throw'); process.exit(1);} catch(e){ console.log('threw:'+e.message); process.exit(0); }
    `
    const res = runWithEnv({ JWT_SECRET: OLD_SECRET }, code)
    const out = res.stdout + res.stderr
    // Old secret is 24 bytes / 24 chars, should fail on byte length check (and hex check if treated as non-hex)
    // Our auth now rejects short secrets, so should throw
    assert.match(out, /too short|hex secret must be at|Insecure/)
  })
})
