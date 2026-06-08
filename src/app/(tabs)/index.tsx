﻿import BalanceCard from "@/components/BalanceCard";
import BudgetProgressCard from "@/components/BudgetProgressCard";
import SimpleBarChart from "@/components/SimpleBarChart";
import ThemedScreen from "@/components/ThemedScreen";
import TransactionItem from "@/components/TransactionItem";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { getTotalExpenses, getTotalIncome } from "@/utils/calculateBudget";
import { prevMonth } from "@/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { selectedMonth } = useSettingsStore();
  const theme = useThemeColors();
  const { format } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Firestore listeners are realtime — just give UI a moment to reflect latest state
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const displayName = user?.displayName ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { accounts } = useAccountStore();
  const balance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts],
  );
  const monthlyIncome = getTotalIncome(transactions, selectedMonth);
  const monthlyExpenses = getTotalExpenses(transactions, selectedMonth);
  const savingsRate =
    monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;

  const chartData = (() => {
    const months: string[] = [];
    let ym = selectedMonth;
    for (let i = 0; i < 6; i++) {
      months.unshift(ym);
      ym = prevMonth(ym);
    }
    return months.map((m) => {
      const [y, mo] = m.split("-").map(Number);
      return {
        month: new Date(y, mo - 1, 1).toLocaleString("en-US", {
          month: "short",
        }),
        income: getTotalIncome(transactions, m),
        expense: getTotalExpenses(transactions, m),
      };
    });
  })();

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const alertCategories = categories.filter(
    (c) =>
      c.monthlyLimit !== null &&
      c.monthlyLimit > 0 &&
      c.spent / c.monthlyLimit >= 0.8,
  );

  return (
    <ThemedScreen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressBackgroundColor={theme.card}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <BalanceCard
          balance={balance}
          holderName={displayName}
          accountCount={accounts.length}
        />

        {/* Month summary */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { borderLeftColor: Colors.success, backgroundColor: theme.card },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Income
            </Text>
            <Text style={[styles.summaryAmt, { color: Colors.success }]}>
              {format(monthlyIncome)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { borderLeftColor: Colors.danger, backgroundColor: theme.card },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryAmt, { color: Colors.danger }]}>
              {format(monthlyExpenses)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { borderLeftColor: Colors.primary, backgroundColor: theme.card },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Saved
            </Text>
            <Text style={[styles.summaryAmt, { color: Colors.primary }]}>
              {savingsRate.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Budget alert banner */}
        {alertCategories.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push("/(tabs)/budgets")}
          >
            <Ionicons
              name="warning-outline"
              size={16}
              color={Colors.secondary}
            />
            <Text style={styles.alertText}>
              {alertCategories.length}{" "}
              {alertCategories.length === 1 ? "category" : "categories"} near
              budget limit
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        )}

        {/* Analytics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Analytics
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <SimpleBarChart data={chartData} />
          </View>
        </View>

        {/* Budget alerts preview */}
        {alertCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Budget Alerts
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/budgets")}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {alertCategories.slice(0, 2).map((cat) => (
              <BudgetProgressCard key={cat.id} category={cat} />
            ))}
          </View>
        )}

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {recent.map((tx, i) => (
              <View key={tx.id}>
                <TransactionItem transaction={tx} />
                {i < recent.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: theme.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 140, gap: Spacing.three },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  bellBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryLabel: { fontSize: 11, marginBottom: 2 },
  summaryAmt: { fontSize: 14, fontWeight: "700" },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    backgroundColor: Colors.secondary + "15",
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    borderWidth: 1,
    borderColor: Colors.secondary + "40",
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.secondary,
  },
  section: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  viewAll: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  divider: { height: 1 },
});
