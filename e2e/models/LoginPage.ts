import { type Locator, type Page } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly heading: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly registerLink: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /hmoney/i })
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/^пароль$/i)
    this.submitButton = page.getByRole('button', { name: /войти/i })
    this.registerLink = page.getByRole('link', { name: /зарегистрироваться/i })
  }

  async goto() {
    await this.page.goto('/')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
