import { type Locator, type Page } from '@playwright/test'

export class RegisterPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmInput: Locator
  readonly submitButton: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/^пароль$/i)
    this.confirmInput = page.getByLabel(/подтверждение/i)
    this.submitButton = page.getByRole('button', { name: /создать аккаунт/i })
    this.loginLink = page.getByRole('link', { name: /войти/i })
  }

  async goto() {
    await this.page.goto('/register')
  }

  async register(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmInput.fill(password)
    await this.submitButton.click()
  }
}
