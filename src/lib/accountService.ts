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
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types/account'

function accountsRef(userId: string) {
  return collection(db, 'users', userId, 'accounts')
}

export async function fetchAccounts(userId: string): Promise<Account[]> {
  const q = query(accountsRef(userId), orderBy('createdAt'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Account))
}

export async function createAccount(userId: string, data: CreateAccountInput): Promise<string> {
  const ref = await addDoc(accountsRef(userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateAccount(userId: string, accountId: string, data: UpdateAccountInput) {
  await updateDoc(doc(accountsRef(userId), accountId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteAccount(userId: string, accountId: string) {
  await deleteDoc(doc(accountsRef(userId), accountId))
}
