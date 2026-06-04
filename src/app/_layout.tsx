import { useFirebaseSync } from "@/hooks/useFirebaseSync";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useSyncCategorySpent } from "@/hooks/useSyncCategorySpent";
import { useSyncSettings } from "@/hooks/useSyncSettings";
import { listenToAuthChanges } from "@/services/auth";
import {
    registerForPushNotifications,
    scheduleMonthlyReport,
} from "@/services/notifications";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useGoalStore } from "@/store/goalStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import * as LocalAuthentication from "expo-local-authentication";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import AppDialog from "@/components/AppDialog";
import ToastContainer from "@/components/ToastContainer";

export default function RootLayout() {
  const { user, loading } = useAuthStore();
  const { theme, biometricLock, notifications } = useSettingsStore();
  const setTxUserId = useTransactionStore((s) => s.setUserId);
  const setCatUserId = useCategoryStore((s) => s.setUserId);
  const setGoalUserId = useGoalStore((s) => s.setUserId);
  const setAccountUserId = useAccountStore((s) => s.setUserId);
  const systemScheme = useColorScheme();

  const effectiveTheme = theme === "system" ? (systemScheme ?? "light") : theme;

  // Wire userId into all stores
  useEffect(() => {
    const uid = user?.uid ?? null;
    setTxUserId(uid);
    setCatUserId(uid);
    setGoalUserId(uid);
    setAccountUserId(uid);

  }, [user?.uid]);

  // Biometric lock on app open
  useEffect(() => {
    if (!user || !biometricLock) return;
    LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock FinanceFlow",
      fallbackLabel: "Use Passcode",
    }).then((result) => {
      if (!result.success) {
        useAuthStore.getState().signOut();
        router.replace("/auth/login");
      }
    });
  }, [user?.uid, biometricLock]);

  // Register push notifications + schedule monthly report
  useEffect(() => {
    if (!user || !notifications) return;
    registerForPushNotifications().catch(() => {});
    scheduleMonthlyReport().catch(() => {});
  }, [user?.uid, notifications]);

  // Firestore real-time subscriptions
  useFirebaseSync(user?.uid ?? null);

  // Auto-create due recurring transactions on app open
  useRecurringTransactions();

  // Keep category.spent in sync with actual transactions
  useSyncCategorySpent();
  useSyncSettings(user?.uid ?? null);

  // Auth state listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = listenToAuthChanges();
    } catch {
      useAuthStore.getState().setUser(null);
    }
    return () => unsubscribe?.();
  }, []);

  // Navigate based on auth state
  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth/login");
    }
  }, [user, loading]);

  return (
    <>
      <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="modals/add-transaction"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="modals/add-category"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="modals/add-goal"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="modals/add-account"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="modals/transfer"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <AppDialog />
      <ToastContainer />
    </>
  );
}
