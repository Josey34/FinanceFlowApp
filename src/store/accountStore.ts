import { create } from "zustand";
import {
  addAccount as fsAdd,
  deleteAccount as fsDelete,
  updateAccount as fsUpdate,
} from "../services/accounts";
import { Account } from "../types";

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
    if (!userId) return;
    await fsAdd(userId, account);
  },

  updateAccount: async (id, updates) => {
    const { userId } = get();
    if (!userId) return;
    await fsUpdate(userId, id, updates);
  },

  deleteAccount: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await fsDelete(userId, id);
  },

  getTotalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
}));
