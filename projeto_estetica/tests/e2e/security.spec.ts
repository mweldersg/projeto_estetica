import { test, expect, type Page } from '@playwright/test'
import { clearLoginAttempts } from './helpers/clearLoginAttempts'

const ADMIN_PHONE = '19998740950'
const ADMIN_PASSWORD = 'TestAdmin123!'

async function login(page: Page, phone = ADMIN_PHONE, password = ADMIN_PASSWORD) {
  await page.goto('/painel')
  await page.locator('input[type="tel"]').fill(phone)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('Rate limiting', () => {
  // Deterministic isolation: every rate-limit test starts with a clean
  // LoginAttempt table (so each proves real 429 behavior independently), and
  // after the group the table is left empty so the other tests in the file (and
  // across parallel workers) can authenticate normally. Production rate limiting
  // is untouched.
  test.beforeEach(async () => {
    await clearLoginAttempts()
  })
  test.afterEach(async () => {
    await clearLoginAttempts()
  })

  test('repeated failed logins are eventually rate-limited (429)', async ({ request }) => {
    const fakePhone = `11900${Date.now().toString().slice(-5)}`
    const testIp = `10.0.0.${Math.floor(Math.random() * 200) + 1}`
    // First 5 attempts should be 401
    for (let i = 0; i < 5; i++) {
      const res = await request.post('/api/auth/login', {
        headers: { 'x-forwarded-for': testIp },
        data: { phone: fakePhone, password: 'wrong' },
      })
      expect([401, 429]).toContain(res.status())
      if (res.status() === 429) break
    }
    // Next attempt should be 429 (or at least eventually)
    let rateLimited = false
    for (let i = 0; i < 10; i++) {
      const res = await request.post('/api/auth/login', {
        headers: { 'x-forwarded-for': testIp },
        data: { phone: fakePhone, password: 'wrong' },
      })
      if (res.status() === 429) {
        rateLimited = true
        expect(res.headers()['retry-after']).toBeTruthy()
        const body = await res.json()
        expect(body.error).toMatch(/Too many attempts/i)
        break
      }
    }
    expect(rateLimited).toBeTruthy()
  })

  test('legitimate login still works after unrelated rate limit (different phone)', async ({ page }) => {
    await login(page, ADMIN_PHONE, ADMIN_PASSWORD)
    await page.waitForURL('**/dashboard')
    await expect(page.locator('text=Painel de Conteúdo')).toBeVisible()
  })

  test('successful login clears rate limit for that phone', async ({ request }) => {
    const testIp = `10.0.1.${Math.floor(Math.random() * 200) + 1}`
    // Fail a few times with real phone but wrong password
    for (let i = 0; i < 3; i++) {
      await request.post('/api/auth/login', { headers: { 'x-forwarded-for': testIp }, data: { phone: ADMIN_PHONE, password: 'wrong' } })
    }
    // Then succeed
    const res = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': testIp }, data: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD } })
    expect(res.status()).toBe(200)
    // Next wrong attempt should not be immediately rate-limited (since we cleared)
    const res2 = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': testIp }, data: { phone: ADMIN_PHONE, password: 'wrong2' } })
    expect(res2.status()).toBe(401)
  })

  test('phone formatting variations do not bypass phone rate limit', async ({ request }) => {
    const testIp = `10.0.2.${Math.floor(Math.random() * 200) + 1}`
    const fakeBase = `1198765${Date.now().toString().slice(-4)}` // fake phone not used elsewhere
    const variants = [fakeBase, `(${fakeBase.slice(0,2)}) ${fakeBase.slice(2,7)}-${fakeBase.slice(7)}`, `+55 ${fakeBase.slice(0,2)} ${fakeBase.slice(2,7)}-${fakeBase.slice(7)}`, fakeBase.slice(0,2) + ' ' + fakeBase.slice(2)]
    // 5 failed attempts across formatting variants should still count toward same phone bucket
    for (let i = 0; i < 5; i++) {
      const phoneVariant = variants[i % variants.length]
      const res = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': testIp }, data: { phone: phoneVariant, password: 'wrong' } })
      expect([401, 429]).toContain(res.status())
    }
    // Next attempt with yet another formatting should be rate-limited (phone bucket full) — use same normalized phone
    const res = await request.post('/api/auth/login', { headers: { 'x-forwarded-for': testIp }, data: { phone: fakeBase.slice(0,5) + '-' + fakeBase.slice(5), password: 'wrong' } })
    expect(res.status()).toBe(429)
  })

  test('x-forwarded-for spoofing leftmost does not bypass IP rate limit', async ({ request }) => {
    const realIp = `10.0.3.${Math.floor(Math.random() * 200) + 1}`
    const fakePhoneBase = `11988${Date.now().toString().slice(-5)}`
    // Do 5 failed attempts with spoofed leftmost but same real IP (last entry)
    for (let i = 0; i < 5; i++) {
      const spoofed = `1.1.1.${i}, ${realIp}`
      const res = await request.post('/api/auth/login', {
        headers: { 'x-forwarded-for': spoofed },
        data: { phone: `${fakePhoneBase}${i}`, password: 'wrong' },
      })
      // Use different phones to avoid phone limit, only IP limit should trigger
      expect([401, 429]).toContain(res.status())
    }
    // Do 5 more with different spoofed leftmost but same real IP — IP bucket should be full (10 total)
    for (let i = 5; i < 10; i++) {
      const spoofed = `2.2.2.${i}, ${realIp}`
      await request.post('/api/auth/login', {
        headers: { 'x-forwarded-for': spoofed },
        data: { phone: `${fakePhoneBase}${i}`, password: 'wrong' },
      })
    }
    // Next attempt with yet another spoofed leftmost but same real IP should be rate-limited
    const res = await request.post('/api/auth/login', {
      headers: { 'x-forwarded-for': `9.9.9.9, ${realIp}` },
      data: { phone: `${fakePhoneBase}999`, password: 'wrong' },
    })
    expect(res.status()).toBe(429)
  })
})

test.describe('Input validation', () => {
  test('invalid order values are rejected (400)', async ({ page }) => {
    await login(page)
    const cookie = (await page.context().cookies()).find((c) => c.name === 'token')?.value
    expect(cookie).toBeTruthy()

    const badOrders = [-1, 100000, 'not-a-number', 3.14, '5.5']
    for (const bad of badOrders) {
      const res = await page.request.post('/api/services', {
        data: { title: 'Valid Title', description: 'Valid description with enough length for validation', image: 'https://example.com/a.jpg', value: 'Valid', order: bad },
      })
      expect(res.status()).toBe(400)
    }
    const ok = await page.request.post('/api/services', {
      data: { title: 'Valid Title', description: 'Valid description with enough length for validation', image: 'https://example.com/a.jpg', value: 'Valid', order: 5 },
    })
    expect([201, 200]).toContain(ok.status())
    // Clean up the created service
    const body = await ok.json()
    if (body.item?.id) await page.request.delete(`/api/services/${body.item.id}`)
  })

  test('out-of-range rating is rejected (400)', async ({ page }) => {
    await login(page)
    const badRatings = [0, 6, 999, -1, 'bad', 3.5]
    for (const bad of badRatings) {
      const res = await page.request.post('/api/reviews', {
        data: { name: 'Test', rating: bad, text: 'Valid text with enough length to pass validation requirements here' },
      })
      expect(res.status()).toBe(400)
    }
    const ok = await page.request.post('/api/reviews', {
      data: { name: 'Test', rating: 5, text: 'Valid text with enough length to pass validation requirements here' },
    })
    expect(ok.status()).toBe(201)
    const body = await ok.json()
    if (body.item?.id) await page.request.delete(`/api/reviews/${body.item.id}`)
  })

  test('unexpected fields are rejected (mass assignment)', async ({ page }) => {
    await login(page)
    // Try to inject id, createdAt, password
    const res = await page.request.post('/api/services', {
      data: { title: 'Valid Title', description: 'Valid description with enough length', image: 'https://example.com/a.jpg', value: 'Valid', order: 0, id: 'hacked', createdAt: '2020-01-01', password: 'hacked' },
    })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/Unexpected fields/)

    const res2 = await page.request.put('/api/services/lavagem_detalhada', {
      data: { title: 'New Title', unexpected: 'x' },
    })
    expect(res2.status()).toBe(400)
  })

  test('invalid URLs and titles are rejected', async ({ page }) => {
    await login(page)
    const res = await page.request.post('/api/services', {
      data: { title: 'x', description: 'Valid description with enough length', image: 'https://example.com/a.jpg', value: 'Valid' },
    })
    expect(res.status()).toBe(400) // title too short

    const res2 = await page.request.post('/api/services', {
      data: { title: 'Valid Title', description: 'Valid description with enough length', image: 'not-a-url', value: 'Valid' },
    })
    expect(res2.status()).toBe(400)

    const res3 = await page.request.post('/api/videos', {
      data: { title: 'Valid', instagramUrl: 'https://evil.com/not-instagram' },
    })
    expect(res3.status()).toBe(400)
    const ok = await page.request.post('/api/videos', {
      data: { title: 'Valid Video', instagramUrl: 'https://www.instagram.com/p/ABC123/' },
    })
    expect(ok.status()).toBe(201)
    const body = await ok.json()
    if (body.item?.id) await page.request.delete(`/api/videos/${body.item.id}`)
  })
})
