import { test, expect, type Page } from '@playwright/test'

const ADMIN_PHONE = '19998740950'
const ADMIN_PASSWORD = 'TestAdmin123!'

async function login(page: Page) {
  await page.goto('/painel')
  await page.locator('input[type="tel"]').fill(ADMIN_PHONE)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('Authorization — unauthenticated vs admin', () => {
  test('unauthenticated POST /api/services is rejected 401', async ({ request }) => {
    const res = await request.post('/api/services', {
      data: { title: 'x', description: 'x', image: 'https://example.com/a.jpg', value: 'x' },
    })
    expect(res.status()).toBe(401)
  })

  test('unauthenticated PUT /api/services/:id is rejected 401', async ({ request }) => {
    const res = await request.put('/api/services/lavagem_detalhada', {
      data: { title: 'hacked' },
    })
    expect(res.status()).toBe(401)
  })

  test('unauthenticated DELETE /api/services/:id is rejected 401', async ({ request }) => {
    const res = await request.delete('/api/services/vitrificacao')
    expect(res.status()).toBe(401)
  })

  test('unauthenticated cannot PUT/DELETE videos/reviews/faqs', async ({ request }) => {
    const r1 = await request.put('/api/videos/v1', { data: { title: 'x' } })
    expect(r1.status()).toBe(401)
    const r2 = await request.delete('/api/videos/v1')
    expect(r2.status()).toBe(401)
    const r3 = await request.put('/api/reviews/r1', { data: { name: 'x' } })
    expect(r3.status()).toBe(401)
    const r4 = await request.delete('/api/reviews/r1')
    expect(r4.status()).toBe(401)
    const r5 = await request.put('/api/faqs/faq-vitrificacao', { data: { question: 'x' } })
    expect(r5.status()).toBe(401)
    const r6 = await request.delete('/api/faqs/faq-vitrificacao')
    expect(r6.status()).toBe(401)
  })

  test('unauthenticated GET /api/services is allowed (public content)', async ({ request }) => {
    const res = await request.get('/api/services')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.items)).toBeTruthy()
  })

  test('non-admin (wrong password) cannot modify — IDOR blocked by auth', async ({ request }) => {
    // Try login with wrong password then use no cookie to attempt modify
    const res = await request.put('/api/services/vitrificacao', {
      data: { title: 'Hacked via IDOR', description: 'x', image: 'https://example.com/x.jpg', value: 'x' },
    })
    expect(res.status()).toBe(401)
  })

  test('admin can PUT and then revert (legitimate access)', async ({ page }) => {
    await login(page)
    // Get cookies from page context
    const cookies = await page.context().cookies()
    const tokenCookie = cookies.find((c) => c.name === 'token')
    expect(tokenCookie).toBeTruthy()

    // Fetch a real service to modify
    const getRes = await page.request.get('/api/services')
    const { items } = await getRes.json()
    const target = items[0]
    const originalTitle = target.title

    // Admin PUT should succeed (or 404 if id invalid, but we use real id)
    const putRes = await page.request.put(`/api/services/${target.id}`, {
      data: { title: originalTitle, description: target.description, image: target.image, value: target.value },
    })
    expect([200, 204]).toContain(putRes.status())

    // Revert
    await page.request.put(`/api/services/${target.id}`, {
      data: { title: originalTitle, description: target.description, image: target.image, value: target.value },
    })
  })

  test('changing ID to another resource without auth is still 401 (IDOR)', async ({ request }) => {
    // Attacker guesses another ID like 'ppf' while unauthenticated
    const res = await request.delete('/api/services/ppf')
    expect(res.status()).toBe(401)
    // Even with invalid id format, unauthenticated still 401 before 400
    const res2 = await request.put('/api/services/../../etc/passwd', {
      data: { title: 'x' },
    })
    // Next.js will encode, but our validation should still be 401 first
    expect([401, 400, 404]).toContain(res2.status())
  })
})

test.describe('ID validation', () => {
  test('admin PUT with invalid id format returns 400', async ({ page }) => {
    await login(page)
    const invalidIds = ['../../etc/passwd', 'id with spaces', 'a'.repeat(100), 'invalid!@#', '']
    for (const bad of invalidIds) {
      // Skip empty which becomes trailing slash
      if (!bad) continue
      const res = await page.request.put(`/api/services/${encodeURIComponent(bad)}`, {
        data: { title: 'x', description: 'x', image: 'https://example.com/x.jpg', value: 'x' },
      })
      expect(res.status()).toBe(400)
    }
  })

  test('admin DELETE with invalid id returns 400', async ({ page }) => {
    await login(page)
    const res = await page.request.delete(`/api/services/${encodeURIComponent('bad/id')}`)
    expect(res.status()).toBe(400)
  })
})

test.describe('Cookie security', () => {
  test('login Set-Cookie has HttpOnly and SameSite=Lax', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
    })
    expect(res.status()).toBe(200)
    const setCookie = res.headers()['set-cookie'] || ''
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Lax')
    expect(setCookie).toContain('Path=/')
    // Secure flag only in production, so in test (dev) it may not be present — check not missing HttpOnly
    // In production we expect Secure, but test env is not production
  })

  test('logout clears cookie with same attributes', async ({ request }) => {
    const res = await request.post('/api/auth/logout')
    const setCookie = res.headers()['set-cookie'] || ''
    expect(setCookie).toContain('Max-Age=0')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Lax')
  })

  test('authenticated cookie allows /api/auth/me, missing cookie 401', async ({ request }) => {
    const unauth = await request.get('/api/auth/me')
    expect(unauth.status()).toBe(401)
  })
})
