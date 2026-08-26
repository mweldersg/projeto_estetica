import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('shows all key sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=Garage 765').first()).toBeVisible()
    await expect(page.locator('text=Nossas Soluções Premium')).toBeVisible()
    await expect(page.locator('text=Transformações em Vídeo')).toBeVisible()
    await expect(page.locator('text=Avaliações dos Nossos Clientes')).toBeVisible()
    await expect(page.locator('text=Acompanhe nosso Instagram!')).toBeVisible()
    await expect(page.locator('text=Agendar via WhatsApp')).toBeVisible()
  })

  test('videos carousel navigates between videos', async ({ page }) => {
    await page.goto('/')
    await page.locator('#videos-instagram').scrollIntoViewIfNeeded()

    const section = page.locator('#videos-instagram')
    const counter = section.getByText(/^\d+ \/ \d+$/)
    const initial = await counter.textContent()
    const total = Number(initial?.split(' / ')[1] ?? 0)

    await expect(section.getByTitle('Vídeo do Instagram')).toBeVisible()
    await expect(counter).toHaveText(`1 / ${total}`)

    await page.getByRole('button', { name: 'Próximo vídeo' }).click()
    await expect(counter).toHaveText(`2 / ${total}`)

    await page.getByRole('button', { name: 'Vídeo anterior' }).click()
    await expect(counter).toHaveText(`1 / ${total}`)
  })

  test('booking form redirects to WhatsApp deep link with prefilled message', async ({ page }) => {
    await page.goto('/')
    await page.locator('#book-name').fill('João Teste')
    await page.locator('#book-vehicle').fill('BMW 320i 2024')
    await page.locator('#book-service').selectOption('Vitrificação de Pintura')
    await page.locator('#book-date').fill('2026-10-15')
    await page.locator('#book-time').fill('09:00')

    const waRequest = page.waitForRequest((req) => req.url().startsWith('https://wa.me/'))
    await page.getByRole('button', { name: 'Agendar via WhatsApp' }).click()

    const url = new URL((await waRequest).url())
    const message = url.searchParams.get('text') ?? ''

    expect(url.origin + url.pathname).toBe('https://wa.me/5519998740950')
    expect(message).toContain('João Teste')
    expect(message).toContain('Vitrificação de Pintura')
    expect(message).toContain('BMW 320i 2024')
    expect(message).toContain('15/10/2026')
    expect(message).toContain('09:00')
  })

  test('clicking a service card preselects it in the booking form', async ({ page }) => {
    await page.goto('/')
    await page.locator('#services').scrollIntoViewIfNeeded()
    const firstCard = page.locator('[data-testid^="service-card-"]').first()
    const expectedTitle = await firstCard.locator('h3').textContent()
    // Map title to select value (for PPF the value differs from title)
    const expectedValue = expectedTitle?.includes('PPF') ? 'PPF (Paint Protection Film)' : expectedTitle?.trim() ?? ''
    await firstCard.getByRole('link', { name: 'Agendar Este Serviço' }).click()
    await expect(page.locator('#book-service')).toHaveValue(expectedValue)
  })

  test('whatsapp popup opens with contact message and deep link', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Falar com a gente no WhatsApp' }).click()
    await expect(page.locator('text=Ficou com alguma dúvida? Entre em contato!')).toBeVisible()

    const link = page.getByRole('link', { name: 'Conversar no WhatsApp' })
    await expect(link).toHaveAttribute('href', 'https://wa.me/5519998740950')

    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')

    const url = popup.url()
    expect(url.startsWith('https://wa.me/') || url.startsWith('https://api.whatsapp.com/')).toBe(true)
  })
})
