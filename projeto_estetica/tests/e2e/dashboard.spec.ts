import { test, expect, type Page } from '@playwright/test'

// Marker used by the "Saiba mais" edit test — deterministic across repeat runs.
const SAIBA_MAIS_MARKER = 'CONTEÚDO EDITADO E2E — descrição do modal alterada pelo painel com texto longo o suficiente.'

const ADMIN_PHONE = '19998740950'
const ADMIN_PASSWORD = 'TestAdmin123!'

async function loginAsAdmin(page: Page) {
  await page.goto('/painel')
  await page.locator('input[type="tel"]').fill(ADMIN_PHONE)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('Login', () => {
  test('non-admin phone is rejected', async ({ page }) => {
    await page.goto('/painel')
    await page.locator('input[type="tel"]').fill('11988776655')
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('admin login with wrong password shows error', async ({ page }) => {
    await page.goto('/painel')
    await page.locator('input[type="tel"]').fill(ADMIN_PHONE)
    await page.locator('input[type="password"]').fill('wrong')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('admin login redirects to content dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator('text=Painel de Conteúdo')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Serviços' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Vídeos' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Depoimentos' })).toBeVisible()
  })

  test('session persists across landing page navigation', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator('text=Painel de Conteúdo')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Painel' })).toBeVisible()

    await page.goto('/painel')
    await page.waitForURL('**/dashboard')
    await expect(page.locator('text=Painel de Conteúdo')).toBeVisible()
  })
})

test.describe('Content Manager', () => {
  test('admin can edit a review', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('tab', { name: 'Depoimentos' }).click()

    await page.getByRole('button', { name: 'Editar' }).first().click()
    await page.getByLabel('Nome do Cliente').fill('Nome Editado')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.locator('text=Nome Editado')).toBeVisible()
  })

  test('admin can delete a service', async ({ page }) => {
    await loginAsAdmin(page)
    const row = page.locator('div.bg-garage-card', { hasText: 'Revestimento e Micropintura' })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Excluir' }).click()
    const modal = page.locator('div.fixed.inset-0').filter({ hasText: 'Esta ação não pode ser desfeita' })
    await modal.getByRole('button', { name: 'Excluir' }).click()

    await expect(row).toHaveCount(0)
  })

  test('admin can edit the Saiba mais description of a service', async ({ page }) => {
    await loginAsAdmin(page)

    const list = await page.request.get('/api/services')
    expect(list.ok()).toBeTruthy()
    const { items }: { items: Array<{ id: string; title: string; longDescription?: string | null }> } = await list.json()
    const target = items.find((i) => i.title.includes('Vitrificação'))
    expect(target).toBeTruthy()
    // Idempotent start: clear any longDescription left by an interrupted earlier
    // run, so we always begin from the built-in-copy baseline.
    await page.request.put(`/api/services/${target!.id}`, { data: { longDescription: '' } })
    const baseline = await (await page.request.get('/api/services')).json()
    const clean = baseline.items.find((i: { id: string }) => i.id === target!.id)
    expect(clean.longDescription ?? '').toBe('')

    // Edit the modal description through the admin UI
    const row = page.locator('div.bg-garage-card', { hasText: 'Vitrificação' })
    await row.getByRole('button', { name: 'Editar' }).click()
    await page.getByLabel('Descrição detalhada').fill(SAIBA_MAIS_MARKER)
    await page.getByRole('button', { name: 'Salvar' }).click()
    // ContentManager closes the dialog only after the PUT resolves — waiting on
    // it guarantees the save finished before we load the public page (otherwise
    // this is a race against the async request).
    const editDialog = page.getByText('Editar item - Serviços')
    await expect(editDialog).toBeHidden()

    // The public landing page modal now shows the admin-edited copy
    await page.goto('/')
    const card = page.locator('[data-testid^="service-card-"]').filter({ hasText: 'Vitrificação' })
    await card.getByRole('button', { name: /Saiba mais/i }).click()
    await expect(page.getByTestId('service-modal-description')).toContainText(SAIBA_MAIS_MARKER)
    await page.getByTestId('service-modal-close').click()

    // Restore: clearing longDescription reverts to the built-in copy, keeping
    // every other suite's expectations about default modal content stable.
    const restore = await page.request.put(`/api/services/${target!.id}`, {
      data: { longDescription: '' },
    })
    expect(restore.ok()).toBeTruthy()
    const after = await (await page.request.get('/api/services')).json()
    const restored = after.items.find((i: { id: string }) => i.id === target!.id)
    expect(restored.longDescription ?? '').toBe('')
  })

  test('creating a service requires all required fields', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('text=Preencha o campo "Título"')).toBeVisible()
  })

  test('admin can add a FAQ', async ({ page }) => {
    await loginAsAdmin(page)

    // Self-cleanup from previous runs so the strict-mode locator below stays
    // unique even when the suite runs repeatedly against the same database.
    // Uses the authenticated request context; the ContentManager re-fetches
    // from the server after creating, so no page reload is needed here.
    const existing = await page.request.get('/api/faqs')
    if (existing.ok()) {
      const { items = [] }: { items?: Array<{ id: string; question: string }> } = await existing.json()
      for (const item of items) {
        if (item.question === 'Qual o horário de funcionamento?') {
          await page.request.delete(`/api/faqs/${item.id}`)
        }
      }
    }

    await page.getByRole('tab', { name: 'Perguntas Frequentes' }).click()
    await page.getByRole('button', { name: 'Adicionar' }).click()
    await page.getByLabel('Pergunta').fill('Qual o horário de funcionamento?')
    await page.getByLabel('Resposta').fill('De segunda a sábado, das 8h às 18h.')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.locator('text=Qual o horário de funcionamento?')).toBeVisible()
  })
})
