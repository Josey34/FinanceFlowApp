import { create } from 'zustand';
import { Transaction, TransactionType } from '../types';
import { getYearMonth } from '../utils/formatDate';
import { uid } from '../utils/uid';
import {
  addTransaction as fsAdd,
  updateTransaction as fsUpdate,
  deleteTransaction as fsDelete,
} from '../services/transactions';


interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  setUserId: (id: string | null) => void;
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  getMonthlyTransactions: (yearMonth: string) => Transaction[];
  getTotalByType: (type: TransactionType, yearMonth?: string) => number;
  getByCategory: (categoryId: string) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  userId: null,

  setUserId: (userId) => set({ userId }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addTransaction: async (tx) => {
    const { userId } = get();
    if (userId) {
      await fsAdd(userId, tx); // throws on failure — caller handles with showError
      return; // real-time listener updates local state
    }
    // Demo mode only
    const createdAt = new Date().toISOString().split('T')[0];
    const id = uid();
    set((s) => ({ transactions: [{ ...tx, id, createdAt }, ...s.transactions] }));
  },

  updateTransaction: async (id, updates) => {
    const { userId } = get();
    if (userId) {
      await fsUpdate(userId, id, updates);
      return;
    }
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTransaction: async (id) => {
    const { userId } = get();
    if (userId) {
      await fsDelete(userId, id);
      return;
    }
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  getMonthlyTransactions: (yearMonth) =>
    get().transactions.filter((t) => getYearMonth(t.date) === yearMonth),

  getTotalByType: (type, yearMonth) => {
    const txs = yearMonth
      ? get().transactions.filter((t) => getYearMonth(t.date) === yearMonth)
      : get().transactions;
    return txs
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  },

  getByCategory: (categoryId) =>
    get().transactions.filter((t) => t.categoryId === categoryId),
}));
