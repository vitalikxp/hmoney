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
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

function envelopesRef(userId: string) {
  return collection(db, 'users', userId, 'envelopes')
}

export async function fetchEnvelopes(userId: string): Promise<Envelope[]> {
  const q = query(envelopesRef(userId), orderBy('sortOrder'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Envelope))
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
