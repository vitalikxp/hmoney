import { backend } from './backend'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

export async function fetchEnvelopes(userId: string): Promise<Envelope[]> {
  return backend.envelopes.fetch(userId)
}

const BUILT_IN_ENVELOPES: Array<{ name: string; icon: string; sortOrder: number }> = [
  { name: 'Резервы', icon: '🛡️', sortOrder: 0 },
]

export async function ensureBuiltInEnvelopes(userId: string): Promise<void> {
  const existing = await fetchEnvelopes(userId)
  const hasBuiltIn = existing.some((e) => e.isBuiltIn)

  if (!hasBuiltIn) {
    for (const tmpl of BUILT_IN_ENVELOPES) {
      await createEnvelope(userId, {
        name: tmpl.name,
        isGoal: false,
        balance: 0,
        sortOrder: tmpl.sortOrder,
        icon: tmpl.icon,
        isBuiltIn: true,
      })
    }
  }
}

export async function createEnvelope(userId: string, data: CreateEnvelopeInput): Promise<string> {
  return backend.envelopes.create(userId, data)
}

export async function updateEnvelope(userId: string, envelopeId: string, data: UpdateEnvelopeInput): Promise<void> {
  await backend.envelopes.update(userId, envelopeId, data)
}

export async function deleteEnvelope(userId: string, envelopeId: string): Promise<void> {
  await backend.envelopes.delete(userId, envelopeId)
}
