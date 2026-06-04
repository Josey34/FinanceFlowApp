import { Transaction, Category } from '../types';
import { getYearMonth } from './formatDate';

export function getSpentByCategory(
  transactions: Transaction[],
  yearMonth: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === 'expense' && getYearMonth(tx.date) === yearMonth) {
      result[tx.categoryId] = (result[tx.categoryId] ?? 0) + Math.abs(tx.amount);
    }
  }
  return result;
}

export function getCategoryBudgetPct(category: Category): number {
  if (!category.monthlyLimit || category.monthlyLimit === 0) return 0;
  return Math.min((category.spent / category.monthlyLimit) * 100, 100);
}

export function getBudgetStatus(pct: number): 'safe' | 'warning' | 'danger' {
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  return 'safe';
}

export function getTotalIncome(transactions: Transaction[], yearMonth: string): number {
  return transactions
    .filter((t) => t.type === 'income' && getYearMonth(t.date) === yearMonth)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[], yearMonth: string): number {
  return transactions
    .filter((t) => t.type === 'expense' && getYearMonth(t.date) === yearMonth)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function getRolloverAmount(
  category: Category,
  transactions: Transaction[],
  prevMonthYM: string,
): number {
  if (!category.monthlyLimit) return 0;
  const spent = transactions
    .filter((t) => t.type === 'expense' && t.categoryId === category.id && getYearMonth(t.date) === prevMonthYM)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return Math.max(0, category.monthlyLimit - spent);
}
