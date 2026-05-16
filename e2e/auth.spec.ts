import { expect } from '@playwright/test'
import { test } from './fixtures'
import { RegisterPage } from './models/RegisterPage'
import { LoginPage } from './models/LoginPage'

const TEST_EMAIL = `test-${Date.now()}@vitalik.dev`
const TEST_PASSWORD = 'Pa$$w0rd'

test.describe('Аутентификация', () => {
  test('редирект с / на /login для неавторизованного', async ({ loginPage }) => {
    await loginPage.goto()

    await expect(loginPage.page).toHaveURL(/\/login/)
    await expect(loginPage.heading).toBeVisible()
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
    await expect(loginPage.registerLink).toBeVisible()
  })

  test('регистрация → логаут → вход', async ({ page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.goto()
    await registerPage.register(TEST_EMAIL, TEST_PASSWORD)
    await expect(page.getByText(TEST_EMAIL)).toBeVisible()

    await page.getByRole('button', { name: /выйти/i }).click()
    await expect(page).toHaveURL(/\/login/)

    const loginPage = new LoginPage(page)
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
    await expect(page.getByText(TEST_EMAIL)).toBeVisible()
  })

  test('неверный email или пароль — ошибка', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.login('nonexistent@test.com', 'wrong')
    await expect(loginPage.page.getByText('Неверный email или пароль')).toBeVisible()
  })

  test('пароли не совпадают — ошибка', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/email/i).fill('test@test.com')
    await page.getByLabel(/^пароль$/i).fill('123456')
    await page.getByLabel(/подтверждение/i).fill('654321')
    await page.getByRole('button', { name: /создать аккаунт/i }).click()
    await expect(page.getByText('Пароли не совпадают')).toBeVisible()
  })

  test('короткий пароль — ошибка', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/email/i).fill('test@test.com')
    await page.getByLabel(/^пароль$/i).fill('12')
    await page.getByLabel(/подтверждение/i).fill('12')
    await page.getByRole('button', { name: /создать аккаунт/i }).click()
    await expect(page.getByText('Пароль должен быть не менее 6 символов')).toBeVisible()
  })
})
