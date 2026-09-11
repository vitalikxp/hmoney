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
import type { Account } from '../../../types/account'
import type { Envelope } from '../../../types/envelope'
import type { Transaction } from '../../../types/transaction'
import type { AccountRepository, EnvelopeRepository, TransactionRepository } from '../types'
import { getFirebase } from './firebase'

// Граница сериализации: Firestore хранит Timestamp, домен — number (epoch ms)
function mapDoc<T>(id: string, data: { createdAt: { toMillis(): number }; updatedAt: { toMillis(): number } } & object): T {
  const { createdAt, updatedAt, ...rest } = data
  return { ...(rest as object), id, createdAt: createdAt.toMillis(), updatedAt: updatedAt.toMillis() } as T
}

function accountsRef(userId: string) {
  const { db } = getFirebase()
  return collection(db, 'users', userId, 'accounts')
}

function envelopesRef(userId: string) {
  const { db } = getFirebase()
  return collection(db, 'users', userId, 'envelopes')
}

function transactionsRef(userId: string) {
  const { db } = getFirebase()
  return collection(db, 'users', userId, 'transactions')
}

export const accountsRepository: AccountRepository = {
  async fetch(userId) {
    const snapshot = await getDocs(query(accountsRef(userId), orderBy('createdAt')))
    return snapshot.docs.map((d) => mapDoc<Account>(d.id, d.data() as never))
  },

  async create(userId, data) {
    const docRef = await addDoc(accountsRef(userId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(userId, accountId, data) {
    await updateDoc(doc(accountsRef(userId), accountId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  async delete(userId, accountId) {
    await deleteDoc(doc(accountsRef(userId), accountId))
  },
}

export const envelopesRepository: EnvelopeRepository = {
  async fetch(userId) {
    const snapshot = await getDocs(query(envelopesRef(userId), orderBy('createdAt')))
    return snapshot.docs.map((d) => mapDoc<Envelope>(d.id, d.data() as never))
  },

  async create(userId, data) {
    const docRef = await addDoc(envelopesRef(userId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(userId, envelopeId, data) {
    await updateDoc(doc(envelopesRef(userId), envelopeId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  async delete(userId, envelopeId) {
    await deleteDoc(doc(envelopesRef(userId), envelopeId))
  },
}

export const transactionsRepository: TransactionRepository = {
  async fetch(userId) {
    const snapshot = await getDocs(query(transactionsRef(userId), orderBy('createdAt')))
    return snapshot.docs.map((d) => mapDoc<Transaction>(d.id, d.data() as never))
  },

  async create(userId, data) {
    const docRef = await addDoc(transactionsRef(userId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(userId, transactionId, data) {
    await updateDoc(doc(transactionsRef(userId), transactionId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  async delete(userId, transactionId) {
    await deleteDoc(doc(transactionsRef(userId), transactionId))
  },
}
