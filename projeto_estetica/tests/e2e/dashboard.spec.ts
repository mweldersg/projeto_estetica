import { test, expect, type Page } from '@playwright/test'

const ADMIN_PHONE = '19998740950'

async function loginAsAdmin(page: Page) {
  await page.goto('/painel')
  await page.locator('input[type="tel"]').fill(ADMIN_PHONE)
  await page.locator('input[type="password"]').fill('password')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('Login', () => {
  test('non-admin phone is rejected', async ({ page }) => {
    await page.goto('/painel')
    await page.locator('input[type="tel"]').fill('11988776655')
    await page.locator('input[type="password"]').fill('password')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.locator('text=Acesso restrito')).toBeVisible()
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

  test('creating a service is blocked until the required image is uploaded', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByRole('button', { name: 'Criar' })).toBeDisabled()
    await expect(page.locator('text=Envie o arquivo para habilitar.')).toBeVisible()
  })
})
