import { useEffect, useState } from 'react'
import { useAccountStore } from '../stores/accountStore'
import AccountList from '../components/accounts/AccountList'
import AccountModal from '../components/accounts/AccountModal'
import Layout from '../components/Layout'
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types/account'

export default function AccountsPage() {
  const { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccountStore()
  const [modalAccount, setModalAccount] = useState<Account | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleCreate = async (data: CreateAccountInput | UpdateAccountInput) => {
    await createAccount(data as CreateAccountInput)
  }

  const handleEdit = async (data: CreateAccountInput | UpdateAccountInput) => {
    if (!modalAccount) return
    await updateAccount(modalAccount.id, data)
  }

  const handleDelete = async (account: Account) => {
    if (!window.confirm(`Удалить счёт «${account.name}»?`)) return
    await deleteAccount(account.id)
  }

  const openCreate = () => {
    setModalAccount(null)
    setShowModal(true)
  }

  const openEdit = (account: Account) => {
    setModalAccount(account)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Счета</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          + Создать
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-lg text-sm text-rose">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">Загрузка…</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-hairline rounded-xl">
          <p className="text-muted mb-4">У вас пока нет счетов</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Создать первый счёт
          </button>
        </div>
      ) : (
        <AccountList
          accounts={accounts}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <AccountModal
          account={modalAccount}
          onSubmit={modalAccount ? handleEdit : handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}
