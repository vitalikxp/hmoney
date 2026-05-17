import { type Locator, type Page } from '@playwright/test'

export class AccountModal {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  private get form(): Locator {
    return this.page.locator('form')
  }

  get nameInput(): Locator {
    return this.form.getByPlaceholder('Наличные, Карта, …')
  }

  get balanceInput(): Locator {
    return this.form.locator('#balance')
  }

  get creditLimitInput(): Locator {
    return this.form.locator('#credit-limit-amount')
  }

  get submitButton(): Locator {
    return this.form.getByRole('button', { name: /^(создать|сохранить)$/i })
  }

  get cancelButton(): Locator {
    return this.form.getByRole('button', { name: /отмена/i })
  }

  async fillName(text: string) {
    await this.nameInput.fill(text)
  }

  async setBalance(value: number) {
    await this.balanceInput.fill(String(value))
  }

  async pickIcon(emoji: string) {
    await this.form.getByRole('button', { name: emoji }).click()
  }

  async enableCreditLimit(limit: number) {
    await this.form.getByLabel('Кредитный лимит').check()
    await this.creditLimitInput.fill(String(limit))
  }

  async uncheckIncludeInBalance() {
    await this.form.getByLabel('Участвует в общем балансе').uncheck()
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
