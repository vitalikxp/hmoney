import { test as base } from '@playwright/test'
import { LoginPage } from './models/LoginPage'
import { RegisterPage } from './models/RegisterPage'
import { AccountsPage } from './models/AccountsPage'
import { AccountModal } from './models/AccountModal'
import { EnvelopesPage } from './models/EnvelopesPage'
import { EnvelopeModal } from './models/EnvelopeModal'
import { TransactionsPage } from './models/TransactionsPage'

export type MyFixtures = {
  loginPage: LoginPage
  registerPage: RegisterPage
  accountsPage: AccountsPage
  accountModal: AccountModal
  envelopesPage: EnvelopesPage
  envelopeModal: EnvelopeModal
  transactionsPage: TransactionsPage
}

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page)
    await use(registerPage)
  },
  accountsPage: async ({ page }, use) => {
    const accountsPage = new AccountsPage(page)
    await use(accountsPage)
  },
  accountModal: async ({ page }, use) => {
    const accountModal = new AccountModal(page)
    await use(accountModal)
  },
  envelopesPage: async ({ page }, use) => {
    const envelopesPage = new EnvelopesPage(page)
    await use(envelopesPage)
  },
  envelopeModal: async ({ page }, use) => {
    const envelopeModal = new EnvelopeModal(page)
    await use(envelopeModal)
  },
  transactionsPage: async ({ page }, use) => {
    const transactionsPage = new TransactionsPage(page)
    await use(transactionsPage)
  },
})

export { expect } from '@playwright/test'
