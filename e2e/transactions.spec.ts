import { expect } from './fixtures'
import { test } from './fixtures'
import { RegisterPage } from './models/RegisterPage'
import { AccountsPage } from './models/AccountsPage'

const PASSWORD = 'Pa$$w0rd'

async function registerAndLogin(page: import('@playwright/test').Page): Promise<string> {
  const email = `test-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@vitalik.dev`
  const registerPage = new RegisterPage(page)
  await registerPage.goto()
  await registerPage.register(email, PASSWORD)
  await expect(page.getByText(email)).toBeVisible()
  return email
}

// Транзакции привязаны к счёту — создаём базовый счёт
async function registerAndCreateAccount(page: import('@playwright/test').Page): Promise<void> {
  await registerAndLogin(page)
  const accountsPage = new AccountsPage(page)
  await accountsPage.goto()
  await accountsPage.createAccount('Карта', { balance: 10000 })
}

test.describe('Транзакции', () => {
  test('пустое состояние', async ({ page, transactionsPage }) => {
    await registerAndLogin(page)
    await transactionsPage.goto()

    await expect(transactionsPage.heading).toBeVisible()
    await expect(transactionsPage.emptyMessage).toBeVisible()
    await expect(transactionsPage.firstTransactionButton).toBeVisible()
    await expect(transactionsPage.createButton).toBeVisible()
  })

  test('создать транзакцию через NL-ввод', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createTransaction('5*250 яблоки', 'Продукты')

    await expect(page.getByText('Продукты')).toBeVisible()
    await expect(page.getByText('− 1 250₽')).toBeVisible()
    await expect(transactionsPage.emptyMessage).not.toBeVisible()
  })

  test('создать транзакцию в конверт и проверить влияние на балансы', async ({ page, transactionsPage, accountsPage }) => {
    await registerAndCreateAccount(page)

    await transactionsPage.goto()
    await transactionsPage.createTransaction('500 молоко', 'Продукты', 'Резервы')

    // расход из счёта и конверта: 10 000 → 9 500 (заголовок группы и карточка)
    await accountsPage.goto()
    await expect(page.getByText(/9\s*500₽/)).toHaveCount(2)
  })

  test('транзакции группируются по дням', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createTransaction('100 кофе', 'Кафе')
    await transactionsPage.createTransaction('200 чай', 'Кафе')

    // обе в одном блоке дня: заголовок с количеством (2)
    await expect(page.getByText(/\(2\)/)).toBeVisible()
    await expect(page.getByText(/−\s*100₽/)).toBeVisible()
    await expect(page.getByText(/−\s*200₽/)).toBeVisible()
  })

  test('редактировать транзакцию', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createTransaction('100 кофе', 'Кафе')
    await transactionsPage.editTransaction('Кафе', '250 обед')

    await expect(page.getByText('− 250₽')).toBeVisible()
    await expect(page.getByText('− 100₽')).not.toBeVisible()
  })

  test('удалить транзакцию', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createTransaction('100 кофе', 'Кафе')
    await transactionsPage.deleteTransaction('Кафе')

    await expect(page.getByText('Транзакций пока нет')).toBeVisible()
  })
})
