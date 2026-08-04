import { test, expect, type Page } from '@playwright/test'

const PNG_1PX =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const ADMIN_PHONE = '19998740950'

async function loginAsAdmin(page: Page) {
  await page.goto('/painel')
  await page.locator('input[type="tel"]').fill(ADMIN_PHONE)
  await page.locator('input[type="password"]').fill('password')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

async function uploadInDialog(page: Page, fieldLabel: string, file: { name: string; mimeType: string; buffer: Buffer }) {
  const uploadResponse = page.waitForResponse((res) => res.url().includes('/api/upload'))
  await page.getByLabel(fieldLabel).setInputFiles(file)
  const response = await uploadResponse
  expect(response.ok()).toBeTruthy()
  await expect(page.locator('text=Arquivo enviado')).toBeVisible()
}

async function deleteRow(page: Page, title: string) {
  const row = page.locator('div.bg-garage-card', { hasText: title })
  await row.getByRole('button', { name: 'Excluir' }).click()
  const modal = page.locator('div.fixed.inset-0').filter({ hasText: 'Esta ação não pode ser desfeita' })
  await modal.getByRole('button', { name: 'Excluir' }).click()
  await expect(row).toHaveCount(0)
}

test.skip(!process.env.GOOGLE_REFRESH_TOKEN, 'Google Drive OAuth not configured')

test.describe('Media upload (Google Drive)', () => {
  test('admin uploads a service image and it renders on the landing page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByLabel('Título').fill('Serviço com imagem do Drive')
    await page.getByLabel('Descrição').fill('Descrição do serviço de teste')
    await uploadInDialog(page, 'Imagem', { name: 'test.png', mimeType: 'image/png', buffer: Buffer.from(PNG_1PX, 'base64') })
    await page.getByLabel('Valor (usado no agendamento)').fill('R$ 100')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.locator('text=Serviço com imagem do Drive')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Serviço com imagem do Drive' })).toBeVisible()
    const imageCard = page.locator('div[style*="/api/media/"]')
    await expect(imageCard.first()).toBeVisible()

    await page.goto('/dashboard')
    await deleteRow(page, 'Serviço com imagem do Drive')
  })

  test('replacing the service image keeps the same Drive file (smart update)', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByLabel('Título').fill('Serviço smart update')
    await page.getByLabel('Descrição').fill('Descrição')
    await uploadInDialog(page, 'Imagem', { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from(PNG_1PX, 'base64') })
    await page.getByLabel('Valor (usado no agendamento)').fill('R$ 50')
    await page.getByRole('button', { name: 'Criar' }).click()

    const row = page.locator('div.bg-garage-card', { hasText: 'Serviço smart update' })
    await expect(row).toBeVisible()

    const before = await page.request.get('/api/services').then((r) => r.json())
    const firstUrl = before.items.find((s: { title: string }) => s.title === 'Serviço smart update').image

    await row.getByRole('button', { name: 'Editar' }).click()
    await uploadInDialog(page, 'Imagem', { name: 'b.png', mimeType: 'image/png', buffer: Buffer.from(PNG_1PX, 'base64') })
    await page.getByRole('button', { name: 'Salvar' }).click()

    const after = await page.request.get('/api/services').then((r) => r.json())
    const secondUrl = after.items.find((s: { title: string }) => s.title === 'Serviço smart update').image
    expect(secondUrl).toBe(firstUrl)

    await deleteRow(page, 'Serviço smart update')
  })

  test('deleting a service also removes its Drive file', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByLabel('Título').fill('Serviço a excluir')
    await page.getByLabel('Descrição').fill('Descrição')
    await uploadInDialog(page, 'Imagem', { name: 'c.png', mimeType: 'image/png', buffer: Buffer.from(PNG_1PX, 'base64') })
    await page.getByLabel('Valor (usado no agendamento)').fill('R$ 30')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('text=Serviço a excluir')).toBeVisible()

    const list = await page.request.get('/api/services').then((r) => r.json())
    const url = list.items.find((s: { title: string }) => s.title === 'Serviço a excluir').image

    const row = page.locator('div.bg-garage-card', { hasText: 'Serviço a excluir' })
    await row.getByRole('button', { name: 'Excluir' }).click()
    const modal = page.locator('div.fixed.inset-0').filter({ hasText: 'Esta ação não pode ser desfeita' })
    await modal.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.locator('text=Serviço a excluir')).toHaveCount(0)

    const id = url.match(/(\/|^)(api\/)?media\/([^/?]+)/)?.[3]
    const res = await page.request.get(`/api/media/${id}`)
    expect(res.status()).toBe(404)
  })
})
