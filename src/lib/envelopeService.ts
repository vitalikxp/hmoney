import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Envelope, EnvelopeType, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

function envelopesRef(userId: string) {
  return collection(db, 'users', userId, 'envelopes')
}

export async function fetchEnvelopes(userId: string): Promise<Envelope[]> {
  const q = query(envelopesRef(userId), orderBy('createdAt'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Envelope))
}

const BUILT_IN_ENVELOPES: Array<{ name: string; type: EnvelopeType; icon: string; sortOrder: number }> = [
  { name: 'Резервы', type: 'reserve', icon: '🛡️', sortOrder: 0 },
]

export async function ensureBuiltInEnvelopes(userId: string): Promise<void> {
  const existing = await fetchEnvelopes(userId)
  const existingBuiltInTypes = new Set(existing.filter((e) => e.isBuiltIn).map((e) => e.type))

  for (const tmpl of BUILT_IN_ENVELOPES) {
    if (!existingBuiltInTypes.has(tmpl.type)) {
      await createEnvelope(userId, {
        name: tmpl.name,
        type: tmpl.type,
        balance: 0,
        sortOrder: tmpl.sortOrder,
        isHidden: false,
        icon: tmpl.icon,
        isBuiltIn: true,
      })
    }
  }
}

export async function createEnvelope(userId: string, data: CreateEnvelopeInput): Promise<string> {
  const ref = await addDoc(envelopesRef(userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEnvelope(userId: string, envelopeId: string, data: UpdateEnvelopeInput) {
  await updateDoc(doc(envelopesRef(userId), envelopeId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEnvelope(userId: string, envelopeId: string) {
  await deleteDoc(doc(envelopesRef(userId), envelopeId))
}
