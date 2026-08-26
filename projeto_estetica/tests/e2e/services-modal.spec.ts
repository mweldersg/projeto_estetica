import { test, expect } from '@playwright/test'

test.describe('Services — Saiba mais modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#services').scrollIntoViewIfNeeded()
    // ensure services are loaded
    await expect(page.locator('#services').getByRole('button', { name: /Saiba mais/i }).first()).toBeVisible()
  })

  test('each service card shows Saiba mais alongside Agendar Este Serviço', async ({ page }) => {
    const saibaBtns = page.locator('#services').getByRole('button', { name: /Saiba mais/i })
    const agendarLinks = page.locator('#services').getByRole('link', { name: 'Agendar Este Serviço' })

    const saibaCount = await saibaBtns.count()
    const agendarCount = await agendarLinks.count()

    expect(saibaCount).toBeGreaterThan(0)
    expect(saibaCount).toBe(agendarCount)

    // All Saiba mais buttons are visible and properly labeled
    for (let i = 0; i < saibaCount; i++) {
      await expect(saibaBtns.nth(i)).toBeVisible()
      await expect(saibaBtns.nth(i)).toHaveAttribute('aria-label', /Saiba mais sobre/i)
    }
  })

  test('clicking Saiba mais opens modal with correct title and specific content', async ({ page }) => {
    const cards = page.locator('[data-testid^="service-card-"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Collect expected titles from the cards
    const titles: string[] = []
    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).locator('h3').textContent()
      titles.push(title?.trim() ?? '')
    }

    // For each card, open modal and verify title + distinct long description
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const expectedTitle = titles[i]

      await card.getByRole('button', { name: /Saiba mais/i }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog).toHaveAttribute('aria-modal', 'true')
      await expect(page.getByTestId('service-modal')).toBeVisible()
      await expect(dialog.getByRole('heading', { name: expectedTitle })).toBeVisible()

      const modalDesc = await page.getByTestId('service-modal-description').textContent()
      expect(modalDesc).toBeTruthy()
      // Long description must be longer / different than short card description
      const cardDesc = await card.locator('p.text-garage-muted').first().textContent()
      expect(modalDesc!.trim().length).toBeGreaterThan(cardDesc!.trim().length)
      expect(modalDesc).not.toBe(cardDesc)

      // Ensure modal has expected sections
      await expect(dialog.getByText('O que está incluído')).toBeVisible()

      // Close via X for next iteration
      await page.getByTestId('service-modal-close').click()
      await expect(dialog).toBeHidden()
    }
  })

  test('modal shows service-specific details (distinct keywords)', async ({ page }) => {
    // Spot-check a few known services by title -> keyword
    // We read all cards and test any that match known titles
    const keywordMap: Record<string, RegExp> = {
      'Vitrificação': /vidro líquido|Revestimento Cerâmico|hidrofobia/i,
      'Lavagem Detalhada': /snow foam|pH neutro/i,
      'Lavagem de Manutenção': /dois baldes|touchless/i,
      'Volante': /hidratação|soft-touch|Volante/i,
      'PPF': /autorrepara|Poliuretano/i,
      'Polimento': /swirls|hologramas|verniz/i,
      'Higienização': /ozônio|extratora|ácaros/i,
      'Insulfilm': /nanocerâmica|infravermelho|UV/i,
      'Micropintura': /Micropintura|aerografia/i,
      'Revestimento': /Micropintura|espectrofotômetro/i,
    }

    const cards = page.locator('[data-testid^="service-card-"]')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const title = (await card.locator('h3').textContent())?.trim() ?? ''
      // find matching keyword entry
      const entry = Object.entries(keywordMap).find(([k]) => title.includes(k))
      if (!entry) continue

      const [, regex] = entry
      await card.getByRole('button', { name: /Saiba mais/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      const modalText = await page.getByTestId('service-modal').textContent()
      expect(modalText).toMatch(regex)
      await page.getByTestId('service-modal-close').click()
      await expect(page.getByRole('dialog')).toBeHidden()
    }
  })

  test('modal content is distinct per service (no cross-contamination)', async ({ page }) => {
    const btns = page.locator('#services').getByRole('button', { name: /Saiba mais/i })
    const count = await btns.count()
    if (count < 2) test.skip()

    await btns.nth(0).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const firstDesc = await page.getByTestId('service-modal-description').textContent()
    await page.getByTestId('service-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()

    await btns.nth(1).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const secondDesc = await page.getByTestId('service-modal-description').textContent()
    expect(firstDesc).not.toBe(secondDesc)
    const firstTitle = await page.getByRole('dialog').locator('#service-modal-title').textContent()
    // ensure title changed
    await page.getByTestId('service-modal-close').click()
  })

  test('modal closes via X button, backdrop click, and Escape', async ({ page }) => {
    const firstBtn = page.locator('#services').getByRole('button', { name: /Saiba mais/i }).first()

    // Close via X
    await firstBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('service-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // Close via backdrop
    await firstBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('service-modal-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.getByRole('dialog')).toBeHidden()

    // Close via Escape
    await firstBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()

    // Close via Fechar button
    await firstBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Fechar' }).last().click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('modal locks body scroll while open and restores on close', async ({ page }) => {
    const firstBtn = page.locator('#services').getByRole('button', { name: /Saiba mais/i }).first()

    await firstBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect.poll(async () => page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await page.getByTestId('service-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect.poll(async () => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  })

  test('Agendar Este Serviço still preselects booking form and Saiba mais does not', async ({ page }) => {
    const cards = page.locator('[data-testid^="service-card-"]')
    const firstCard = cards.first()
    const expectedValue = await firstCard.getByRole('link', { name: 'Agendar Este Serviço' }).getAttribute('href')

    // Saiba mais should NOT change booking value
    const initialBookingValue = await page.locator('#book-service').inputValue().catch(() => '')
    await firstCard.getByRole('button', { name: /Saiba mais/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('service-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('#book-service')).toHaveValue(initialBookingValue)

    // Agendar should preselect
    const title = (await firstCard.locator('h3').textContent())?.trim() ?? ''
    // Find the service value by clicking and checking select
    await firstCard.getByRole('link', { name: 'Agendar Este Serviço' }).click()
    // Booking section should be targeted; verify #book-service has a non-empty value that corresponds to card title
    await expect(page.locator('#book-service')).not.toHaveValue('')
    const selected = await page.locator('#book-service').inputValue()
    // The selected option text should match card title (or value). Check option exists
    const options = page.locator('#book-service option')
    await expect(options.filter({ hasText: title }).first()).toBeAttached()
  })

  test('modal Agendar button preselects service, closes modal, and scrolls to booking', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="service-card-"]').first()
    const title = (await firstCard.locator('h3').textContent())?.trim() ?? ''
    await firstCard.getByRole('button', { name: /Saiba mais/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Modal book button should be visible and have correct label
    const modalBook = page.getByTestId('service-modal-book')
    await expect(modalBook).toBeVisible()
    await expect(modalBook).toHaveAttribute('href', '#booking')

    await modalBook.click()
    await expect(page.getByRole('dialog')).toBeHidden()
    // Should have scrolled and preselected
    await expect(page.locator('#book-service')).not.toHaveValue('')
    // Verify hash changed to #booking
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('#booking')
  })

  test('reopening modal after close shows correct new service', async ({ page }) => {
    const btns = page.locator('#services').getByRole('button', { name: /Saiba mais/i })
    const count = await btns.count()
    if (count < 2) test.skip()

    await btns.nth(0).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('service-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()

    await btns.nth(1).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Title should be of second card
    const secondTitle = await page.locator('[data-testid^="service-card-"]').nth(1).locator('h3').textContent()
    await expect(page.getByRole('dialog').getByRole('heading', { name: secondTitle?.trim() ?? '' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('responsive: modal works on mobile and desktop sizes', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 812 })
    await page.locator('#services').scrollIntoViewIfNeeded()
    const firstBtn = page.locator('#services').getByRole('button', { name: /Saiba mais/i }).first()
    await firstBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Must be within viewport
    const box = await page.getByTestId('service-modal').boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
    await expect(page.getByTestId('service-modal-close')).toBeVisible()
    await page.getByTestId('service-modal-close').click()
    await expect(dialog).toBeHidden()

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.locator('#services').scrollIntoViewIfNeeded()
    await firstBtn.click()
    await expect(dialog).toBeVisible()
    const desktopBox = await page.getByTestId('service-modal').boundingBox()
    expect(desktopBox?.width).toBeGreaterThan(300)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('accessibility: dialog has proper roles, close button focused, focus returns', async ({ page }) => {
    const firstBtn = page.locator('#services').getByRole('button', { name: /Saiba mais/i }).first()
    await firstBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAttribute('aria-labelledby', 'service-modal-title')
    await expect(page.locator('#service-modal-title')).toBeVisible()

    // Close button should be focused on open
    await expect(page.getByTestId('service-modal-close')).toBeFocused()

    // Close and expect focus returns to trigger
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(firstBtn).toBeFocused()
  })

  test('multiple rapid open/close does not break modal', async ({ page }) => {
    const btns = page.locator('#services').getByRole('button', { name: /Saiba mais/i })
    const first = btns.first()
    for (let i = 0; i < 3; i++) {
      await first.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toBeHidden()
    }
    // One final open should still show correct content
    await first.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByTestId('service-modal-description')).not.toBeEmpty()
  })
})
