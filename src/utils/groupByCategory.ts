import { Transaction } from '../types';

export function groupByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    if (!groups[tx.categoryId]) groups[tx.categoryId] = [];
    groups[tx.categoryId].push(tx);
  }
  return groups;
}

export function groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = tx.date.split('T')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return groups;
}
