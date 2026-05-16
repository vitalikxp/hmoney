import { test as base } from '@playwright/test'
import { LoginPage } from './models/LoginPage'
import { RegisterPage } from './models/RegisterPage'
import { AccountsPage } from './models/AccountsPage'
import { AccountModal } from './models/AccountModal'

export type MyFixtures = {
  loginPage: LoginPage
  registerPage: RegisterPage
  accountsPage: AccountsPage
  accountModal: AccountModal
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
})

export { expect } from '@playwright/test'
