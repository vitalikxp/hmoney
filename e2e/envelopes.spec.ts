import { expect } from '@playwright/test'
import { test } from './fixtures'
import { RegisterPage } from './models/RegisterPage'

const PASSWORD = 'Pa$$w0rd'

async function registerAndLogin(page: import('@playwright/test').Page): Promise<string> {
  const email = `test-env-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@vitalik.dev`
  const registerPage = new RegisterPage(page)
  await registerPage.goto()
  await registerPage.register(email, PASSWORD)
  await expect(page.getByText(email)).toBeVisible()
  return email
}

test.describe('Конверты', () => {
  test('показывает встроенные конверты', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    await expect(envelopesPage.heading).toBeVisible()
    await expect(page.getByRole('button', { name: /ХаниМани/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Резервы/i })).toBeVisible()
  })

  test('создать конверт-фонд', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Фонд ${Date.now()}`
    await envelopesPage.createEnvelope(name, { type: 'Фонды', balance: 5000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
  })

  test('создать конверт-цель с целевой суммой', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Цель ${Date.now()}`
    await envelopesPage.createEnvelope(name, { type: 'Цели', balance: 1000, target: 50000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(page.getByText(/цель 50/)).toBeVisible()
  })

  test('редактировать конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Было ${Date.now()}`
    const newName = `Стало ${Date.now()}`
    await envelopesPage.createEnvelope(name, { type: 'Фонды', balance: 100 })
    await envelopesPage.editEnvelope(name, newName, 200)

    await expect(page.getByText(newName, { exact: true })).toBeVisible()
    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })

  test('удалить конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Удалить ${Date.now()}`
    await envelopesPage.createEnvelope(name, { type: 'Фонды', balance: 0 })
    await envelopesPage.deleteEnvelope(name)

    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })

  test('нельзя удалить встроенный конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    // Navigate from type label (nth(2) of 'ХаниМани') up to card row: type-label → flex-1 → card row
    const row = page.getByText('ХаниМани', { exact: true }).nth(2).locator('..').locator('..')
    await expect(row.getByTitle('Редактировать')).toBeVisible()
    await expect(row.getByTitle('Удалить')).not.toBeVisible()
  })
})
