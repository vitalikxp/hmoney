import { expect } from '@playwright/test'
import { test } from './fixtures'
import { RegisterPage } from './models/RegisterPage'

const PASSWORD = 'Pa$$w0rd'

async function registerAndLogin(page: import('@playwright/test').Page): Promise<string> {
  const email = `test-acct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@vitalik.dev`
  const registerPage = new RegisterPage(page)
  await registerPage.goto()
  await registerPage.register(email, PASSWORD)
  await expect(page.getByText(email)).toBeVisible()
  return email
}

test.describe('Счета', () => {
  test('пустое состояние', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    await page.goto('/accounts')

    await expect(accountsPage.heading).toBeVisible()
    await expect(accountsPage.emptyMessage).toBeVisible()
    await expect(accountsPage.firstAccountButton).toBeVisible()
    await expect(accountsPage.createButton).toBeVisible()
  })

  test('создать счёт с минимальными полями', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Мин ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: 5000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(accountsPage.emptyMessage).not.toBeVisible()
  })

  test('создать счёт с кредитным лимитом', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Кредитка ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: -3000, creditLimit: 100000 })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(page.getByText(/доступно из/)).toBeVisible()
  })

  test('создать счёт исключённым из баланса', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Аккаунт ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: 9999, includeInBalance: false })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(page.getByText('исключён', { exact: true })).toBeVisible()
  })

  test('создать счёт в группе Инвестиции', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Инвест ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: 10000, group: 'Инвестиции' })

    await expect(page.getByText(name, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /инвестиции/i })).toBeVisible()
  })

  test('редактировать счёт', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Было ${Date.now()}`
    const newName = `Стало ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: 777 })

    await accountsPage.editAccount(name, newName, 888)

    await expect(page.getByText(newName, { exact: true })).toBeVisible()
    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })

  test('удалить счёт', async ({ page, accountsPage }) => {
    await registerAndLogin(page)
    const name = `Удалить ${Date.now()}`

    await accountsPage.goto()
    await accountsPage.createAccount(name, { balance: 1 })

    await accountsPage.deleteAccount(name)

    await expect(page.getByText(name, { exact: true })).not.toBeVisible()
  })
})
