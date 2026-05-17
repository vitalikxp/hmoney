import { type Locator, type Page, expect } from '@playwright/test'
import { AccountModal } from './AccountModal'

export class AccountsPage {
  readonly page: Page
  readonly modal: AccountModal

  constructor(page: Page) {
    this.page = page
    this.modal = new AccountModal(page)
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Счета' })
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: '+ Создать' })
  }

  get emptyMessage(): Locator {
    return this.page.getByText('У вас пока нет счетов')
  }

  get firstAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Создать первый счёт' })
  }

  get logoutButton(): Locator {
    return this.page.getByRole('button', { name: /выйти/i })
  }

  get userEmail(): Locator {
    return this.page.locator('header span.text-muted')
  }

  async goto() {
    await this.page.goto('/accounts')
    await expect(this.heading).toBeVisible()
  }

  async createAccount(name: string, overrides?: {
    balance?: number
    icon?: string
    creditLimit?: number
    includeInBalance?: boolean
  }) {
    await this.createButton.click()
    await this.modal.fillName(name)
    if (overrides?.icon) await this.modal.pickIcon(overrides.icon)
    await this.modal.setBalance(overrides?.balance ?? 0)
    if (overrides?.creditLimit != null) await this.modal.enableCreditLimit(overrides.creditLimit)
    if (overrides?.includeInBalance === false) await this.modal.uncheckIncludeInBalance()
    await this.modal.submit()
  }

  private cardRow(name: string): Locator {
    return this.page.getByText(name, { exact: true }).locator('..').locator('..').locator('..')
  }

  async editAccount(name: string, newName: string, newBalance?: number) {
    await this.cardRow(name).getByTitle('Редактировать').click()
    await this.modal.fillName(newName)
    if (newBalance != null) await this.modal.setBalance(newBalance)
    await this.modal.submit()
  }

  async deleteAccount(name: string) {
    this.page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain(name)
      dialog.accept()
    })
    await this.cardRow(name).getByTitle('Удалить').click()
  }

  async isAccountVisible(name: string): Promise<boolean> {
    return this.page.getByText(name, { exact: true }).isVisible()
  }
}
