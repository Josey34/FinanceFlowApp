import { create } from "zustand";
import {
  addAccount as fsAdd,
  deleteAccount as fsDelete,
  updateAccount as fsUpdate,
} from "../services/accounts";
import { Account } from "../types";
import { uid } from "../utils/uid";


interface AccountState {
  accounts: Account[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getTotalBalance: () => number;
}


export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  userId: null,
  setUserId: (userId) => set({ userId }),
  setAccounts: (accounts) => set({ accounts }),

  addAccount: async (account) => {
    const { userId } = get();
    if (userId) {
      await fsAdd(userId, account);
      return;
    }
    set((s) => ({ accounts: [...s.accounts, { ...account, id: uid() }] }));
  },

  updateAccount: async (id, updates) => {
    const { userId } = get();
    if (userId) {
      await fsUpdate(userId, id, updates);
      return;
    }
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },

  deleteAccount: async (id) => {
    const { userId } = get();
    if (userId) {
      await fsDelete(userId, id);
      return;
    }
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
  },

  getTotalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
}));
