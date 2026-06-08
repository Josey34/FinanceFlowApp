import {
    showAlert,
    showChoice,
    showConfirm,
    showInput,
} from "@/components/AppDialog";
import CurrencySelector from "@/components/CurrencySelector";
import ThemedScreen from "@/components/ThemedScreen";
import { APP_THEMES, BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { deleteAccount, signOut } from "@/services/auth";
import {
    exportAllDataJSON,
    exportToCSV,
    ImportedTransaction,
    importFromCSV,
} from "@/services/export";
import { auth } from "@/services/firebase";
import {
    cancelAllNotifications,
    scheduleBillReminder,
    scheduleWeeklyDigest,
} from "@/services/notifications";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types";
import { formatShortDate } from "@/utils/formatDate";
import { showError, showSuccess } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function BillList({ bills }: Readonly<{ bills: Transaction[] }>) {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const { categories } = useCategoryStore();
  if (bills.length === 0) {
    return (
      <Text style={[billStyles.empty, { color: theme.textSecondary }]}>
        No recurring bills found. Add a recurring transaction to track bills.
      </Text>
    );
  }
  return (
    <View style={[billStyles.card, { backgroundColor: theme.card }]}>
      {bills.map((b, i) => {
        const cat = categories.find((c) => c.id === b.categoryId);
        const iconName = (cat?.icon ?? "card") as IoniconsName;
        const iconColor = cat?.color ?? Colors.primary;
        return (
          <View key={b.id}>
            {i > 0 && (
              <View
                style={[billStyles.divider, { backgroundColor: theme.border }]}
              />
            )}
            <View style={billStyles.row}>
              <View
                style={[billStyles.icon, { backgroundColor: iconColor + "30" }]}
              >
                <Ionicons name={iconName} size={18} color={iconColor} />
              </View>
              <View style={billStyles.info}>
                <Text style={[billStyles.name, { color: theme.text }]}>
                  {b.merchant}
                </Text>
                <Text style={[billStyles.due, { color: theme.textSecondary }]}>
                  Due {formatShortDate(b.recurrence!.nextDate)}
                </Text>
              </View>
              <Text style={billStyles.amount}>
                {format(Math.abs(b.amount))}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const billStyles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  divider: { height: 1, marginLeft: 56 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    gap: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  due: { fontSize: 11, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "700", color: Colors.danger },
  empty: { fontSize: 12, paddingHorizontal: Spacing.one },
});

function handleDeleteAccount() {
  showConfirm({
    title: "Delete Account",
    message:
      "This permanently deletes your account and all data. Cannot be undone.",
    confirmLabel: "Delete Account",
    destructive: true,
    onConfirm: async () => {
      try {
        await deleteAccount();
        router.replace("/auth/login");
      } catch {
        showError("Could not delete account. Sign in again and retry.");
      }
    },
  });
}

interface SettingRowProps {
  icon: IoniconsName;
  iconBg: string;
  iconColor?: string;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  right,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
}: Readonly<SettingRowProps>) {
  const theme = useThemeColors();
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor ?? Colors.primary} />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: theme.text },
          danger && { color: Colors.danger },
        ]}
      >
        {label}
      </Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ) : (
        (right ?? (
          <View style={styles.settingRight}>
            {value ? (
              <Text
                style={[styles.settingValue, { color: theme.textSecondary }]}
              >
                {value}
              </Text>
            ) : null}
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textSecondary}
            />
          </View>
        ))
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const theme = useThemeColors();
  const { user } = useAuthStore();
  const {
    notifications,
    toggleNotifications,
    budgetRollover,
    toggleBudgetRollover,
    biometricLock,
    toggleBiometricLock,
    billReminders,
    toggleBillReminders,
    billReminderDays,
    setBillReminderDays,
    weeklyDigest,
    toggleWeeklyDigest,
    weekStartsOn,
    setWeekStartsOn,
    theme: themeMode,
    setTheme,
  } = useSettingsStore();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { transactions, addTransaction } = useTransactionStore();
  const upcomingBills = useMemo(
    () =>
      transactions
        .filter((t) => t.recurring && t.recurrence)
        .sort((a, b) =>
          a.recurrence!.nextDate > b.recurrence!.nextDate ? 1 : -1,
        )
        .slice(0, 5),
    [transactions],
  );

  useEffect(() => {
    if (!weeklyDigest || !notifications) return;
    scheduleWeeklyDigest().catch(() => {});
  }, [weeklyDigest, notifications]);

  useEffect(() => {
    if (!billReminders || !notifications) {
      cancelAllNotifications().catch(() => {});
      return;
    }
    for (const bill of upcomingBills) {
      if (!bill.recurrence) continue;
      const dueDate = new Date(bill.recurrence.nextDate);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - billReminderDays);
      const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000);
      if (reminderDate > new Date() && daysLeft > 0) {
        scheduleBillReminder(
          bill.merchant,
          Math.abs(bill.amount),
          daysLeft,
          reminderDate,
        ).catch(() => {});
      }
    }
  }, [billReminders, billReminderDays, notifications, upcomingBills]);

  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "Not signed in";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleExportCSV() {
    try {
      await exportToCSV(transactions);
    } catch {
      showError("Could not export transactions");
    }
  }

  async function handleExportJSON() {
    try {
      await exportAllDataJSON({ transactions });
    } catch {
      showError("Could not export backup");
    }
  }

  async function handleImportCSV() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const imported: ImportedTransaction[] = await importFromCSV(file.uri);
      showConfirm({
        title: "Import Preview",
        message: `Found ${imported.length} transactions. Import them?`,
        confirmLabel: "Import",
        onConfirm: async () => {
          try {
            for (const tx of imported) {
              await addTransaction(tx);
            }
            showSuccess(`Imported ${imported.length} transactions`);
          } catch {
            showError("Import failed partway through. Check your connection.");
          }
        },
      });
    } catch {
      showError("Could not read the file. Make sure it is a valid CSV.");
    }
  }

  function handleEditProfile() {
    showInput({
      title: "Edit Display Name",
      message: "Enter your name",
      defaultValue: displayName,
      onConfirm: async (value) => {
        const name = value.trim();
        if (!name) return;
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
        useAuthStore
          .getState()
          .setUser({ ...useAuthStore.getState().user!, displayName: name });
      },
    });
  }

  function handleSignOut() {
    showConfirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      confirmLabel: "Sign Out",
      destructive: true,
      onConfirm: async () => {
        await signOut();
        useAuthStore.getState().signOut();
        router.replace("/auth/login");
      },
    });
  }

  return (
    <ThemedScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.pageTitle, { color: theme.text }]}>Settings</Text>

        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View
            style={[styles.profileAvatar, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {email}
            </Text>
            <Text
              style={[styles.profileId, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              ID: {user?.uid ?? "—"}
            </Text>
          </View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
            Preferences
          </Text>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            {/* Currency — inline selector */}
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: Colors.success + "20" },
                ]}
              >
                <Ionicons name="cash" size={18} color={Colors.success} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Currency
              </Text>
              <CurrencySelector />
            </View>
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="color-palette"
              iconBg={theme.primary + "20"}
              iconColor={theme.primary}
              label="Theme"
              value={APP_THEMES[themeMode]?.label ?? "System"}
              onPress={() => setShowThemePicker(true)}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="calendar"
              iconBg={Colors.secondary + "20"}
              iconColor={Colors.secondary}
              label="Week Starts On"
              value={weekStartsOn === 0 ? "Sunday" : "Monday"}
              onPress={() =>
                showChoice("Week Starts On", undefined, [
                  { label: "Sunday", onPress: () => setWeekStartsOn(0) },
                  { label: "Monday", onPress: () => setWeekStartsOn(1) },
                ])
              }
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="repeat"
              iconBg={Colors.primaryLight + "20"}
              iconColor={Colors.primary}
              label="Budget Rollover"
              toggle
              toggleValue={budgetRollover}
              onToggle={toggleBudgetRollover}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
            Security
          </Text>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            <SettingRow
              icon="notifications"
              iconBg="#FFD93D20"
              iconColor="#FFD93D"
              label="Push Notifications"
              toggle
              toggleValue={notifications}
              onToggle={toggleNotifications}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="finger-print"
              iconBg={Colors.primaryLight + "20"}
              iconColor={Colors.primary}
              label="Biometric Lock"
              toggle
              toggleValue={biometricLock}
              onToggle={toggleBiometricLock}
            />
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
            Reminders
          </Text>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            <SettingRow
              icon="card"
              iconBg="#FF7B5420"
              iconColor="#FF7B54"
              label="Bill Reminders"
              toggle
              toggleValue={billReminders}
              onToggle={toggleBillReminders}
            />
            {billReminders && (
              <>
                <View
                  style={[styles.rowDivider, { backgroundColor: theme.border }]}
                />
                <SettingRow
                  icon="alarm"
                  iconBg="#FF7B5420"
                  iconColor="#FF7B54"
                  label="Reminder Lead Time"
                  value={`${billReminderDays} day${billReminderDays !== 1 ? "s" : ""} before`}
                  onPress={() =>
                    showChoice(
                      "Reminder Lead Time",
                      "How many days before the due date?",
                      [
                        {
                          label: "1 day",
                          onPress: () => setBillReminderDays(1),
                        },
                        {
                          label: "2 days",
                          onPress: () => setBillReminderDays(2),
                        },
                        {
                          label: "3 days",
                          onPress: () => setBillReminderDays(3),
                        },
                        {
                          label: "5 days",
                          onPress: () => setBillReminderDays(5),
                        },
                        {
                          label: "7 days",
                          onPress: () => setBillReminderDays(7),
                        },
                      ],
                    )
                  }
                />
              </>
            )}
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="mail"
              iconBg={Colors.success + "20"}
              iconColor={Colors.success}
              label="Weekly Digest"
              toggle
              toggleValue={weeklyDigest}
              onToggle={toggleWeeklyDigest}
            />
          </View>
          {billReminders && <BillList bills={upcomingBills} />}
        </View>

        {/* Manage */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
            Manage
          </Text>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            <SettingRow
              icon="business"
              iconBg={Colors.primary + "20"}
              iconColor={Colors.primary}
              label="Accounts"
              onPress={() => router.push("/modals/add-account")}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="pricetag"
              iconBg={Colors.secondary + "20"}
              iconColor={Colors.secondary}
              label="Categories"
              onPress={() => router.push("/modals/add-category")}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="flag"
              iconBg={Colors.success + "20"}
              iconColor={Colors.success}
              label="Savings Goals"
              onPress={() => router.push("/modals/add-goal")}
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
            Data & Export
          </Text>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            <SettingRow
              icon="bar-chart"
              iconBg={Colors.success + "20"}
              iconColor={Colors.success}
              label="Export CSV"
              onPress={handleExportCSV}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="document-text"
              iconBg={Colors.primary + "20"}
              iconColor={Colors.primary}
              label="Export PDF Statement"
              onPress={() =>
                showAlert(
                  "PDF Export",
                  "Go to Reports tab and tap the download icon",
                )
              }
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="server"
              iconBg={Colors.primaryLight + "20"}
              iconColor={Colors.primary}
              label="Full JSON Backup"
              onPress={handleExportJSON}
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="download"
              iconBg={Colors.secondary + "20"}
              iconColor={Colors.secondary}
              label="Import Bank CSV"
              onPress={handleImportCSV}
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.group}>
          <View style={[styles.groupCard, { backgroundColor: theme.card }]}>
            <SettingRow
              icon="log-out"
              iconBg={Colors.danger + "20"}
              iconColor={Colors.danger}
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
            <View
              style={[styles.rowDivider, { backgroundColor: theme.border }]}
            />
            <SettingRow
              icon="trash"
              iconBg={Colors.danger + "20"}
              iconColor={Colors.danger}
              label="Delete Account"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        <Text style={[styles.version, { color: theme.textSecondary }]}>
          FinanceFlow v1.0.0
        </Text>
      </ScrollView>

      {/* Theme picker */}
      <Modal
        visible={showThemePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <TouchableOpacity
          style={tpStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowThemePicker(false)}
        >
          <View
            style={[tpStyles.card, { backgroundColor: theme.card }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[tpStyles.title, { color: theme.text }]}>
              Choose Theme
            </Text>
            <View style={tpStyles.grid}>
              {(Object.keys(APP_THEMES) as Array<keyof typeof APP_THEMES>).map(
                (key) => {
                  const t = APP_THEMES[key];
                  const active = themeMode === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        tpStyles.swatch,
                        active && { borderColor: t.primary, borderWidth: 2 },
                      ]}
                      onPress={() => {
                        setTheme(key);
                        setShowThemePicker(false);
                      }}
                    >
                      <View
                        style={[tpStyles.swatchBg, { backgroundColor: t.bg }]}
                      >
                        <View
                          style={[
                            tpStyles.swatchDot,
                            { backgroundColor: t.primary },
                          ]}
                        />
                        {active && (
                          <View style={tpStyles.swatchCheck}>
                            <Ionicons name="checkmark" size={10} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[tpStyles.swatchLabel, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedScreen>
  );
}

const tpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  card: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: { fontSize: 17, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  swatch: {
    width: "22%",
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  swatchBg: { height: 56, alignItems: "center", justifyContent: "center" },
  swatchDot: { width: 20, height: 20, borderRadius: 10 },
  swatchCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.one,
  },
});

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  pageTitle: { fontSize: 20, fontWeight: "700", paddingTop: Spacing.two },
  profileCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: "700" },
  profileEmail: { fontSize: 12, marginTop: 2 },
  profileId: { fontSize: 10, marginTop: 2, opacity: 0.6 },
  group: { gap: Spacing.two },
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupCard: {
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    gap: Spacing.two,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  settingValue: { fontSize: 13 },
  rowDivider: { height: 1, marginLeft: Spacing.three + 36 + Spacing.two },
  version: { textAlign: "center", fontSize: 12, marginTop: Spacing.two },
});
