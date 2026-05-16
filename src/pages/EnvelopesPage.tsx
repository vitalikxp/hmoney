import { useEffect, useState } from 'react'
import { useEnvelopeStore } from '../stores/envelopeStore'
import EnvelopeList from '../components/envelopes/EnvelopeList'
import EnvelopeModal from '../components/envelopes/EnvelopeModal'
import Layout from '../components/Layout'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

export default function EnvelopesPage() {
  const { envelopes, loading, error, fetchEnvelopes, createEnvelope, updateEnvelope, deleteEnvelope } = useEnvelopeStore()
  const [modalEnvelope, setModalEnvelope] = useState<Envelope | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEnvelopes()
  }, [])

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
        <EnvelopeList
          envelopes={envelopes}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
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
