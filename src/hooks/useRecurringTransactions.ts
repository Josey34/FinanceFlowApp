import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { todayStr } from '../utils/formatDate';
import { RecurrenceFrequency } from '../types';

function nextOccurrence(dateStr: string, freq: RecurrenceFrequency): string {
  const d = new Date(dateStr);
  switch (freq) {
    case 'daily':   d.setDate(d.getDate() + 1); break;
    case 'weekly':  d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly':  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

export function useRecurringTransactions() {
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();

  useEffect(() => {
    const today = todayStr();
    const due = transactions.filter(
      (t) => t.recurring && t.recurrence && t.recurrence.nextDate <= today,
    );
    if (due.length === 0) return;

    async function processDue() {
      for (const tx of due) {
        if (!tx.recurrence) continue;
        await addTransaction({
          merchant: tx.merchant,
          amount: tx.amount,
          type: tx.type,
          categoryId: tx.categoryId,
          category: tx.category,
          accountId: tx.accountId,
          note: tx.note,
          tags: tx.tags,
          date: tx.recurrence.nextDate,
          icon: tx.icon,
          iconBg: tx.iconBg,
          recurring: false,
        });
        await updateTransaction(tx.id, {
          recurrence: {
            frequency: tx.recurrence.frequency,
            nextDate: nextOccurrence(tx.recurrence.nextDate, tx.recurrence.frequency),
          },
        });
      }
    }
    processDue();
  }, []);
}
