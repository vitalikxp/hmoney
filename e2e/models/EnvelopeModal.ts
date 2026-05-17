import { type Locator, type Page } from '@playwright/test'

export class EnvelopeModal {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  private get form(): Locator {
    return this.page.locator('form')
  }

  get nameInput(): Locator {
    return this.form.getByPlaceholder('Продукты, Ремонт, …')
  }

  get balanceInput(): Locator {
    return this.form.getByRole('spinbutton').first()
  }

  get isGoalCheckbox(): Locator {
    return this.form.getByRole('checkbox', { name: /это цель/i })
  }

  get targetInput(): Locator {
    return this.form.getByRole('spinbutton').nth(1)
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

  async enableTarget(value: number) {
    await this.isGoalCheckbox.check()
    await this.targetInput.fill(String(value))
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
