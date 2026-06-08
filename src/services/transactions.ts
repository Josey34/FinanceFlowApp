import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { Transaction } from "../types";
import { db } from "./firebase";

function txPath(userId: string) {
  return collection(db, "users", userId, "transactions");
}

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "createdAt">,
): Promise<string> {
  if (!data.merchant || !data.date || !data.type) {
    throw new Error("addTransaction: merchant, date, and type are required");
  }
  const payload = Object.fromEntries(
    Object.entries({
      ...data,
      createdAt: Timestamp.now(),
      date: Timestamp.fromDate(new Date(data.date)),
    }).filter(([, v]) => v !== undefined),
  );
  // Ensure date is always present (it's required, but filter could still remove Timestamp if undefined somehow)
  if (!payload.date) {
    payload.date = Timestamp.now();
  }
  const ref = await addDoc(txPath(userId), payload);
  return ref.id;
}

export async function updateTransaction(
  userId: string,
  txId: string,
  data: Partial<Transaction>,
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "transactions", txId), data);
}

export async function deleteTransaction(
  userId: string,
  txId: string,
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "transactions", txId));
}

export function subscribeToTransactions(
  userId: string,
  callback: (txs: Transaction[]) => void,
): Unsubscribe {
  const q = query(txPath(userId), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    const txs = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        date:
          data.date instanceof Timestamp
            ? data.date.toDate().toISOString().split("T")[0]
            : data.date,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
      } as Transaction;
    });
    callback(txs);
  });
}
