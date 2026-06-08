import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { saveSettings, subscribeToSettings } from '../services/settings';
import type { UserSettings } from '../types';

type RemotePrefs = Partial<Omit<UserSettings, 'selectedMonth'>>;

const syncBool = (remote: boolean | undefined, local: boolean, toggle: () => void) => {
  if (remote !== undefined && remote !== local) toggle();
};

const applyRemoteSettings = (prefs: RemotePrefs) => {
  const s = useSettingsStore.getState();
  if (prefs.currency         !== undefined) s.setCurrency(prefs.currency);
  if (prefs.theme            !== undefined) s.setTheme(prefs.theme);
  if (prefs.weekStartsOn     !== undefined) s.setWeekStartsOn(prefs.weekStartsOn);
  if (prefs.billReminderDays !== undefined) s.setBillReminderDays(prefs.billReminderDays);
  syncBool(prefs.budgetRollover, s.budgetRollover, s.toggleBudgetRollover);
  syncBool(prefs.billReminders,  s.billReminders,  s.toggleBillReminders);
  syncBool(prefs.notifications,  s.notifications,  s.toggleNotifications);
  syncBool(prefs.biometricLock,  s.biometricLock,  s.toggleBiometricLock);
  syncBool(prefs.weeklyDigest,   s.weeklyDigest,   s.toggleWeeklyDigest);
};

export function useSyncSettings(userId: string | null) {
  const currency       = useSettingsStore((s) => s.currency);
  const theme          = useSettingsStore((s) => s.theme);
  const notifications  = useSettingsStore((s) => s.notifications);
  const biometricLock  = useSettingsStore((s) => s.biometricLock);
  const weekStartsOn   = useSettingsStore((s) => s.weekStartsOn);
  const budgetRollover = useSettingsStore((s) => s.budgetRollover);
  const billReminders    = useSettingsStore((s) => s.billReminders);
  const billReminderDays = useSettingsStore((s) => s.billReminderDays);
  const weeklyDigest     = useSettingsStore((s) => s.weeklyDigest);

  // Track whether remote settings have been loaded for current user.
  // Prevents overwriting Firestore with defaults before the snapshot arrives.
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  // Subscribe to Firestore settings on login; restore them to store.
  useEffect(() => {
    if (!userId) { setRemoteLoaded(false); return; }
    const unsub = subscribeToSettings(userId, (prefs, exists) => {
      if (exists) applyRemoteSettings(prefs);
      setRemoteLoaded(true);
    });
    return unsub;
  }, [userId]);

  // Save settings to Firestore whenever they change (only after initial load).
  useEffect(() => {
    if (!userId || !remoteLoaded) return;
    saveSettings(userId, {
      currency, theme, notifications, biometricLock,
      weekStartsOn, budgetRollover, billReminders, billReminderDays, weeklyDigest,
    }).catch(() => {});
  }, [userId, currency, theme, notifications, biometricLock,
      weekStartsOn, budgetRollover, billReminders, billReminderDays, weeklyDigest]);
}
