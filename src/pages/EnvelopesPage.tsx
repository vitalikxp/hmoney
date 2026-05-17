import { useEffect, useMemo, useState } from 'react'
import { useEnvelopeStore } from '../stores/envelopeStore'
import { useAccountStore } from '../stores/accountStore'
import EnvelopeList from '../components/envelopes/EnvelopeList'
import EnvelopeModal from '../components/envelopes/EnvelopeModal'
import BudgetSummaryWidget from '../components/envelopes/BudgetSummaryWidget'
import Layout from '../components/Layout'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

export default function EnvelopesPage() {
  const { envelopes, loading, error, fetchEnvelopes, createEnvelope, updateEnvelope, deleteEnvelope } = useEnvelopeStore()
  const { accounts, fetchAccounts } = useAccountStore()
  const [modalEnvelope, setModalEnvelope] = useState<Envelope | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEnvelopes()
    fetchAccounts()
  }, [])

  const summary = useMemo(() => {
    const total = accounts
      .filter((a) => a.includeInBalance)
      .reduce((s, a) => s + a.balance, 0)
    const reserveBalance = envelopes
      .filter((e) => e.isBuiltIn)
      .reduce((s, e) => s + e.balance, 0)
    const envelopesBalance = envelopes
      .filter((e) => !e.isBuiltIn)
      .reduce((s, e) => s + e.balance, 0)
    const spendingBalance = total - reserveBalance - envelopesBalance
    return { total, reserveBalance, envelopesBalance, spendingBalance }
  }, [accounts, envelopes])

  const handleCreate = async (data: CreateEnvelopeInput | UpdateEnvelopeInput) => {
    await createEnvelope(data as CreateEnvelopeInput)
  }

  const handleEdit = async (data: CreateEnvelopeInput | UpdateEnvelopeInput) => {
    if (!modalEnvelope) return
    await updateEnvelope(modalEnvelope.id, data)
  }

  const handleDelete = async (envelope: Envelope) => {
    if (!window.confirm(`Удалить конверт «${envelope.name}»?`)) return
    await deleteEnvelope(envelope.id)
  }

  const openCreate = () => {
    setModalEnvelope(null)
    setShowModal(true)
  }

  const openEdit = (envelope: Envelope) => {
    setModalEnvelope(envelope)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Конверты</h1>
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
      ) : (
        <div className="space-y-3">
          <BudgetSummaryWidget
            spendingBalance={summary.spendingBalance}
            reserveBalance={summary.reserveBalance}
            envelopesBalance={summary.envelopesBalance}
            total={summary.total}
          />
          <EnvelopeList
            envelopes={envelopes}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAdd={openCreate}
          />
        </div>
      )}

      {showModal && (
        <EnvelopeModal
          envelope={modalEnvelope}
          onSubmit={modalEnvelope ? handleEdit : handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}
