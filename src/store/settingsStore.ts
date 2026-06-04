import { create } from 'zustand';
import { ThemeMode, UserSettings } from '../types';

interface SettingsState extends UserSettings {
  selectedMonth: string;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleNotifications: () => void;
  toggleBiometricLock: () => void;
  setWeekStartsOn: (day: 0 | 1) => void;
  toggleBudgetRollover: () => void;
  toggleBillReminders: () => void;
  setBillReminderDays: (days: number) => void;
  toggleWeeklyDigest: () => void;
  setSelectedMonth: (ym: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: 'USD',
  theme: 'system',
  notifications: true,
  biometricLock: false,
  weekStartsOn: 0,
  budgetRollover: false,
  billReminders: true,
  billReminderDays: 3,
  weeklyDigest: false,
  selectedMonth: new Date().toISOString().slice(0, 7),

  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
  toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
  toggleBiometricLock: () => set((s) => ({ biometricLock: !s.biometricLock })),
  setWeekStartsOn: (day) => set({ weekStartsOn: day }),
  toggleBudgetRollover: () => set((s) => ({ budgetRollover: !s.budgetRollover })),
  toggleBillReminders: () => set((s) => ({ billReminders: !s.billReminders })),
  setBillReminderDays: (billReminderDays) => set({ billReminderDays }),
  toggleWeeklyDigest: () => set((s) => ({ weeklyDigest: !s.weeklyDigest })),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
}));
