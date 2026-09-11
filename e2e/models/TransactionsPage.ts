import { type Locator, type Page, expect } from '@playwright/test'

export class TransactionModalPOM {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get inputText(): Locator {
    return this.page.locator('#transaction-input')
  }

  get dateInput(): Locator {
    return this.page.locator('#transaction-date')
  }

  get categoryInput(): Locator {
    return this.page.locator('#transaction-category')
  }

  get accountSelect(): Locator {
    return this.page.locator('#transaction-account')
  }

  get envelopeSelect(): Locator {
    return this.page.locator('#transaction-envelope')
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /^(создать|сохранить)$/i })
  }

  async fill(text: string) {
    await this.inputText.fill(text)
  }

  async setCategory(category: string) {
    await this.categoryInput.fill(category)
  }

  async selectEnvelope(label: string) {
    await this.envelopeSelect.selectOption({ label })
  }

  async submit() {
    await this.submitButton.click()
  }
}

export class TransactionsPage {
  readonly page: Page
  readonly modal: TransactionModalPOM

  constructor(page: Page) {
    this.page = page
    this.modal = new TransactionModalPOM(page)
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Транзакции' })
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: '+ Добавить' })
  }

  get emptyMessage(): Locator {
    return this.page.getByText('Транзакций пока нет')
  }

  get firstTransactionButton(): Locator {
    return this.page.getByRole('button', { name: 'Создать первую транзакцию' })
  }

  async goto() {
    await this.page.goto('/transactions')
    await expect(this.heading).toBeVisible()
  }

  async createTransaction(text: string, category: string, envelope?: string) {
    await this.createButton.click()
    await this.modal.fill(text)
    await this.modal.setCategory(category)
    if (envelope) await this.modal.selectEnvelope(envelope)
    await this.modal.submit()
  }

  async editTransaction(category: string, newText: string): Promise<void> {
    const row = this.cardRow(category)
    await row.getByTitle('Редактировать').click()
    await this.modal.fill(newText)
    await this.modal.submit()
  }

  async deleteTransaction(category: string) {
    this.page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain(category)
      dialog.accept()
    })
    const row = this.cardRow(category)
    await row.getByTitle('Удалить').click()
  }

  private cardRow(category: string) {
    return this.page.getByText(category, { exact: true }).locator('..').locator('..')
  }
}
