import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useSettingsStore } from '../store/settingsStore';
import { getSpentByCategory } from '../utils/calculateBudget';

export function useSyncCategorySpent() {
  const { transactions } = useTransactionStore();
  const { categories, updateSpent } = useCategoryStore();
  const { selectedMonth } = useSettingsStore();

  useEffect(() => {
    const spentMap = getSpentByCategory(transactions, selectedMonth);
    for (const cat of categories) {
      const newSpent = spentMap[cat.id] ?? 0;
      if (cat.spent !== newSpent) {
        updateSpent(cat.id, newSpent);
      }
    }
  }, [transactions, selectedMonth]);
}
