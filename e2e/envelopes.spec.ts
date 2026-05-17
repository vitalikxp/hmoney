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
  test('показывает встроенные суммы', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    await expect(envelopesPage.heading).toBeVisible()
    await expect(page.getByText('ХаниМани', { exact: true })).toBeVisible()
    await expect(page.getByText('Резервы', { exact: true })).toBeVisible()
  })

  test('показывает empty state если нет конвертов', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    await expect(page.getByText('Конвертов пока нет')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Создать первый конверт' })).toBeVisible()
  })

  test('создать конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Конверт ${Date.now()}`
    await envelopesPage.createEnvelope(name, { balance: 5000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
  })

  test('создать конверт-цель с целевой суммой', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Цель ${Date.now()}`
    await envelopesPage.createEnvelope(name, { isGoal: true, balance: 1000, target: 50000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(page.getByText(/цель 50/)).toBeVisible()
  })

  test('редактировать конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Было ${Date.now()}`
    const newName = `Стало ${Date.now()}`
    await envelopesPage.createEnvelope(name, { balance: 100 })
    await envelopesPage.editEnvelope(name, newName, 200)

    await expect(page.getByText(newName, { exact: true })).toBeVisible()
    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })

  test('удалить конверт', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    const name = `Удалить ${Date.now()}`
    await envelopesPage.createEnvelope(name, { balance: 0 })
    await envelopesPage.deleteEnvelope(name)

    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })

  test('встроенные суммы не показывают действия редактирования', async ({ page, envelopesPage }) => {
    await registerAndLogin(page)
    await envelopesPage.goto()

    await expect(page.getByText('ХаниМани', { exact: true })).toBeVisible()
    await expect(page.getByText('Резервы', { exact: true })).toBeVisible()
    await expect(page.getByTitle('Редактировать')).toHaveCount(0)
    await expect(page.getByTitle('Удалить')).toHaveCount(0)
  })
})
