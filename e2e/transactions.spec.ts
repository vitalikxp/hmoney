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

test.describe('Этап 4: режимы, переводы, повторения', () => {
  test('плановая транзакция не влияет на баланс счёта', async ({ page, transactionsPage, accountsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    // План: открыть модал, включить «План»
    await transactionsPage.createButton.click()
    await transactionsPage.modal.fill('5000 отпуск')
    await transactionsPage.modal.setCategory('Планы')
    await page.getByRole('button', { name: 'План', exact: true }).click()
    await transactionsPage.modal.submit()

    await expect(page.getByText('Планы')).toBeVisible()
    await expect(page.getByText('отпуск')).toBeVisible()
    await expect(page.getByText('План').first()).toBeVisible()

    // баланс счёта не изменился: 10 000
    await accountsPage.goto()
    await expect(page.getByText(/10\s*000₽/)).toHaveCount(2)
  })

  test('перевод между счетами', async ({ page, transactionsPage, accountsPage }) => {
    await registerAndCreateAccount(page)

    // второй счёт
    await accountsPage.goto()
    await accountsPage.createAccount('Наличные', { balance: 500 })

    await transactionsPage.goto()
    await transactionsPage.createButton.click()
    await transactionsPage.modal.selectType('Перевод')
    await transactionsPage.modal.selectTransferKind('accounts')
    await transactionsPage.modal.selectTransferFrom('Карта')
    await transactionsPage.modal.selectTransferTo('Наличные')
    await transactionsPage.modal.fill('2000 перевёл себе')
    await transactionsPage.modal.submit()

    await expect(page.getByText('Карта → Наличные')).toBeVisible()

    // 10 000 − 2000 = 8 000 на Карте; 500 + 2000 = 2 500 наличных
    await accountsPage.goto()
    await expect(page.getByText(/8\s*000₽/).first()).toBeVisible()
    await expect(page.getByText(/2\s*500₽/)).toBeVisible()
  })

  test('перевод между конвертами', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    // нужен второй конверт: создаём через страницу Конвертов
    await page.goto('/envelopes')
    await page.getByRole('button', { name: '+ Создать' }).click()
    await page.getByPlaceholder('Продукты, Ремонт, …').fill('Отпуск')
    await page.locator('#envelope-balance').fill('1000')
    await page.getByRole('button', { name: 'Создать', exact: true }).click()
    await expect(page.getByText('Отпуск')).toBeVisible()

    await transactionsPage.goto()
    await transactionsPage.createButton.click()
    await transactionsPage.modal.selectType('Перевод')
    await transactionsPage.modal.selectTransferKind('envelopes')
    await transactionsPage.modal.selectTransferFrom('Резервы')
    await transactionsPage.modal.selectTransferTo('Отпуск')
    await transactionsPage.modal.fill('400 на поездку')
    await transactionsPage.modal.submit()

    await expect(page.getByText('Резервы → Отпуск')).toBeVisible()
  })

  test('повторяющаяся транзакция создаёт серию планов', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createButton.click()
    await transactionsPage.modal.fill('100000 зарплата')
    await transactionsPage.modal.setCategory('Работа')
    await transactionsPage.modal.selectType('Доход')
    await transactionsPage.modal.enableRepeat('Каждый месяц')
    await transactionsPage.modal.submit()

    // экземпляры серии: бейджи 🔁 и «План»
    await expect(page.getByText('🔁').first()).toBeVisible()
    await expect(page.getByText('План').first()).toBeVisible()
  })

  test('правка серии «эту и будущие» пересоздаёт будущие', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createButton.click()
    await transactionsPage.modal.fill('100000 зарплата')
    await transactionsPage.modal.setCategory('Зарплата')
    await transactionsPage.modal.selectType('Доход')
    await transactionsPage.modal.enableRepeat('Каждый месяц')
    await transactionsPage.modal.submit()

    // редактируем первый экземпляр: scope «эту и будущие», новая сумма
    await page.getByTitle('Редактировать').first().click()
    await transactionsPage.modal.fill('120000 зарплата')
    await transactionsPage.modal.chooseScopeFuture()
    await transactionsPage.modal.submit()

    // новая серия создана: «План» с новой суммой
    await expect(page.getByText(/120\s*000₽/).first()).toBeVisible()
  })

  test('редактор категорий переименовывает категорию', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()
    await transactionsPage.createTransaction('100 кофе', 'Кафе')

    await transactionsPage.categoriesButton.click()
    await expect(transactionsPage.categoriesHeading).toBeVisible()

    await page.getByTitle('Переименовать').first().click()
    const input = page.locator('form input[type=text]')
    await input.fill('Кофейни')
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await page.getByRole('button', { name: 'Закрыть', exact: true }).click()

    await expect(page.getByText('Кофейни')).toBeVisible()
    await expect(page.getByText(/^Кафе$/)).toHaveCount(0)
  })
})

test.describe('Переключатель прошлое/будущее', () => {
  test('будущие планы видны только в «Будущее», сегодня — всегда', async ({ page, transactionsPage, accountsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    // факт сегодня
    await transactionsPage.createTransaction('100 кофе', 'Кафе')

    // план на будущее (через 2 недели): дата в модале
    await transactionsPage.createButton.click()
    await transactionsPage.modal.fill('5000 отпуск')
    await transactionsPage.modal.setCategory('Планы')
    const d = new Date()
    d.setDate(d.getDate() + 14)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    await page.locator('#transaction-date').fill(iso)
    await transactionsPage.modal.submit()

    // по умолчанию «Прошлое»: кофе виден, план — нет
    await expect(page.getByText('кофе')).toBeVisible()
    await expect(page.getByText('отпуск')).not.toBeVisible()

    // переключаемся на «Будущее»: план виден, кофе — нет
    await page.getByRole('button', { name: 'Будущее', exact: true }).click()
    await expect(page.getByText('отпуск')).toBeVisible()
    await expect(page.getByText(/^кофе\$/)).toHaveCount(0)

    // сегодняшний день остаётся видимым в обоих режимах
    await page.getByRole('button', { name: 'Прошлое', exact: true }).click()
    await expect(page.getByText('сегодня')).toBeVisible()
    await page.getByRole('button', { name: 'Будущее', exact: true }).click()
    await expect(page.getByText('сегодня')).toBeVisible()
  })
})

test.describe('План не в прошлом', () => {
  test('план с прошедшей датой блокируется с подсказкой', async ({ page, transactionsPage }) => {
    await registerAndCreateAccount(page)
    await transactionsPage.goto()

    await transactionsPage.createButton.click()
    await transactionsPage.modal.fill('500 молоко')
    await transactionsPage.modal.setCategory('Продукты')
    const y = new Date()
    y.setDate(y.getDate() - 2)
    const iso = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
    await page.locator('#transaction-date').fill(iso)
    await page.getByRole('button', { name: 'План', exact: true }).click()

    await expect(page.getByText('Плановая транзакция не создаётся в прошлом')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Создать', exact: true })).toBeDisabled()
  })
})
