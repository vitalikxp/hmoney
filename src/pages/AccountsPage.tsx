import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useAccountStore } from '../stores/accountStore'
import AccountList from '../components/accounts/AccountList'
import AccountModal from '../components/accounts/AccountModal'
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types/account'

export default function AccountsPage() {
  const { user, logout } = useAuthStore()
  const { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccountStore()
  const [modalAccount, setModalAccount] = useState<Account | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleLogout = async () => {
    try { await logout() } catch (e) { console.error('Logout failed', e) }
  }

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
    <div className="bg-canvas min-h-screen">
      <header className="border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-yellow text-lg" aria-hidden="true">🐝</span>
            <span className="text-ink font-bold tracking-tight">hmoney</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
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
      </main>

      {showModal && (
        <AccountModal
          account={modalAccount}
          onSubmit={modalAccount ? handleEdit : handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
