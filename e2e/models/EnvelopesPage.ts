import { type Locator, type Page, expect } from '@playwright/test'
import { EnvelopeModal } from './EnvelopeModal'

export class EnvelopesPage {
  readonly page: Page
  readonly modal: EnvelopeModal

  constructor(page: Page) {
    this.page = page
    this.modal = new EnvelopeModal(page)
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Конверты' })
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: '+ Создать' })
  }

  async goto() {
    await this.page.goto('/envelopes')
    await expect(this.heading).toBeVisible()
  }

  private cardRow(name: string): Locator {
    return this.page.getByText(name, { exact: true }).locator('..').locator('..').locator('..')
  }

  async createEnvelope(name: string, overrides?: {
    type?: string
    balance?: number
    target?: number
  }) {
    await this.createButton.click()
    await this.modal.fillName(name)
    if (overrides?.type) await this.modal.setType(overrides.type)
    await this.modal.setBalance(overrides?.balance ?? 0)
    if (overrides?.target != null) await this.modal.enableTarget(overrides.target)
    await this.modal.submit()
  }

  async editEnvelope(name: string, newName: string, newBalance?: number) {
    await this.cardRow(name).getByTitle('Редактировать').click()
    await this.modal.fillName(newName)
    if (newBalance != null) await this.modal.setBalance(newBalance)
    await this.modal.submit()
  }

  async deleteEnvelope(name: string) {
    this.page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain(name)
      dialog.accept()
    })
    await this.cardRow(name).getByTitle('Удалить').click()
  }
}
