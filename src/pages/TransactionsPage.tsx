import { useEffect, useState } from 'preact/hooks'
import { useTransactionStore } from '../stores/transactionStore'
import { useAccountStore } from '../stores/accountStore'
import { useEnvelopeStore } from '../stores/envelopeStore'
import TransactionList from '../components/transactions/TransactionList'
import TransactionModal from '../components/transactions/TransactionModal'
import CategoriesModal from '../components/transactions/CategoriesModal'
import Layout from '../components/Layout'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../types/transaction'
import type { ListRange } from '../components/transactions/TransactionList'

export default function TransactionsPage() {
  const { transactions, loading, error, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } =
    useTransactionStore()
  const { accounts, fetchAccounts } = useAccountStore()
  const { envelopes, fetchEnvelopes } = useEnvelopeStore()
  const [modalTransaction, setModalTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [range, setRange] = useState<ListRange>('past')

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchEnvelopes()
  }, [])

  const handleCreate = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    await createTransaction(data as CreateTransactionInput)
  }

  const handleEdit = async (
    data: CreateTransactionInput | UpdateTransactionInput,
    scope: 'one' | 'future' = 'one',
  ) => {
    if (!modalTransaction) return
    await updateTransaction(modalTransaction.id, data, scope)
  }

  const handleDelete = async (transaction: Transaction) => {
    const message = transaction.seriesId
      ? `Удалить транзакцию «${transaction.category}»?\n\nOK — удалить также будущие транзакции серии\nОтмена — только эту`
      : `Удалить транзакцию «${transaction.category}»?`
    if (!window.confirm(message)) return
    const scope = transaction.seriesId ? 'future' : 'one'
    await deleteTransaction(transaction.id, scope)
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="px-3 py-2 text-sm text-muted hover:text-ink border border-hairline rounded-lg hover:bg-elevated transition-colors cursor-pointer"
          >
            Категории
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            + Добавить
          </button>
        </div>
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
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRange('past')}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                range === 'past' ? 'bg-yellow text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
              }`}
            >
              Прошлое
            </button>
            <button
              onClick={() => setRange('future')}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                range === 'future' ? 'bg-link text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
              }`}
            >
              Будущее
            </button>
          </div>
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            envelopes={envelopes}
            range={range}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </>
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

      {showCategories && (
        <CategoriesModal
          transactions={transactions}
          onClose={() => setShowCategories(false)}
        />
      )}
    </Layout>
  )
}
