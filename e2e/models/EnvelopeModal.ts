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

  get typeSelect(): Locator {
    return this.form.getByRole('combobox')
  }

  get balanceInput(): Locator {
    return this.form.getByRole('spinbutton').first()
  }

  get targetCheckbox(): Locator {
    return this.form.getByRole('checkbox', { name: /целевая сумма|сумма фонда/i })
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

  async setType(label: string) {
    await this.typeSelect.selectOption(label)
  }

  async setBalance(value: number) {
    await this.balanceInput.fill(String(value))
  }

  async enableTarget(value: number) {
    await this.targetCheckbox.check()
    await this.targetInput.fill(String(value))
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
