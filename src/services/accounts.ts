import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Account } from '../types';

function colPath(userId: string) {
  return collection(db, 'users', userId, 'accounts');
}

export async function addAccount(userId: string, data: Omit<Account, 'id'>): Promise<string> {
  const ref = await addDoc(colPath(userId), data);
  return ref.id;
}

export async function updateAccount(userId: string, accountId: string, data: Partial<Account>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'accounts', accountId), data);
}

export async function deleteAccount(userId: string, accountId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'accounts', accountId));
}

export function subscribeToAccounts(
  userId: string,
  callback: (accounts: Account[]) => void,
): Unsubscribe {
  return onSnapshot(colPath(userId), (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Account)));
  });
}

export async function seedDefaultAccounts(userId: string, accounts: Account[]): Promise<void> {
  for (const acc of accounts) {
    const { id: _id, ...data } = acc;
    await addDoc(colPath(userId), data);
  }
}
