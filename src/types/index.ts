export type TransactionType = 'income' | 'expense';
export type AccountType = 'cash' | 'bank' | 'credit' | 'savings';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'system' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'midnight';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  note: string;
  tags: string[];
  date: string;
  createdAt: string;
  recurring: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    nextDate: string;
  };
  // UI helpers (derived from categoryId)
  merchant: string;
  icon: string;
  iconBg: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyLimit: number | null;
  isDefault: boolean;
  archived: boolean;
  spent: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
}

export interface Budget {
  yearMonth: string;
  categorySpending: Record<string, number>;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: string;
  deadline: string | null;
  icon: string;
  color: string;
  completed: boolean;
}

export interface UserSettings {
  currency: string;
  theme: ThemeMode;
  notifications: boolean;
  biometricLock: boolean;
  weekStartsOn: 0 | 1;
  budgetRollover: boolean;
  billReminders: boolean;
  billReminderDays: number;
  weeklyDigest: boolean;
}

export interface PieSegment {
  name: string;
  percentage: number;
  color: string;
}

export interface BarDataPoint {
  month: string;
  income: number;
  expense: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  dailyTotals: { day: number; total: number }[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
