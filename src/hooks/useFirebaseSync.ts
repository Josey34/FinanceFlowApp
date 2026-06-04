import { useEffect } from "react";
import { subscribeToAccounts } from "../services/accounts";
import {
    seedDefaultCategories,
    subscribeToCategories,
} from "../services/categories";
import { subscribeToGoals } from "../services/goals";
import { subscribeToTransactions } from "../services/transactions";
import { useAccountStore } from "../store/accountStore";
import { useCategoryStore } from "../store/categoryStore";
import { useGoalStore } from "../store/goalStore";
import { useTransactionStore } from "../store/transactionStore";

function clearStores() {
  useTransactionStore.getState().setTransactions([]);
  useAccountStore.getState().setAccounts([]);
  useCategoryStore.getState().setCategories([]);
  useGoalStore.setState({ goals: [] });
}

export function useFirebaseSync(userId: string | null) {
  const setTransactions = useTransactionStore((s) => s.setTransactions);
  const setCategories = useCategoryStore((s) => s.setCategories);
  const setAccounts = useAccountStore((s) => s.setAccounts);

  useEffect(() => {
    if (!userId) {
      clearStores();
      return;
    }

    const unsubs = [
      subscribeToTransactions(userId, setTransactions),

      subscribeToCategories(userId, async (cats) => {
        if (cats.length === 0) {
          const defaults = useCategoryStore.getState().categories;
          await seedDefaultCategories(userId, defaults);
        } else {
          setCategories(cats);
        }
      }),

      subscribeToGoals(userId, (goals) => {
        useGoalStore.setState({ goals });
      }),

      subscribeToAccounts(userId, (accounts) => {
        setAccounts(accounts);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [userId]);
}
