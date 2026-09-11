import { useEffect, useState } from 'preact/hooks'
import { useTransactionStore } from '../stores/transactionStore'
import { useAccountStore } from '../stores/accountStore'
import { useEnvelopeStore } from '../stores/envelopeStore'
import TransactionList from '../components/transactions/TransactionList'
import TransactionModal from '../components/transactions/TransactionModal'
import Layout from '../components/Layout'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../types/transaction'

export default function TransactionsPage() {
  const { transactions, loading, error, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } =
    useTransactionStore()
  const { accounts, fetchAccounts } = useAccountStore()
  const { envelopes, fetchEnvelopes } = useEnvelopeStore()
  const [modalTransaction, setModalTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchEnvelopes()
  }, [])

  const handleCreate = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    await createTransaction(data as CreateTransactionInput)
  }

  const handleEdit = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    if (!modalTransaction) return
    await updateTransaction(modalTransaction.id, data)
  }

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm(`Удалить транзакцию «${transaction.category}»?`)) return
    await deleteTransaction(transaction.id)
  }

  const openCreate = () => {
    setModalTransaction(null)
    setShowModal(true)
  }

  const openEdit = (transaction: Transaction) => {
    setModalTransaction(transaction)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Транзакции</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          + Добавить
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-lg text-sm text-rose">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">Загрузка…</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted mb-4">Транзакций пока нет</div>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Создать первую транзакцию
          </button>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <TransactionModal
          transaction={modalTransaction}
          accounts={accounts}
          envelopes={envelopes}
          onSubmit={modalTransaction ? handleEdit : handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}
