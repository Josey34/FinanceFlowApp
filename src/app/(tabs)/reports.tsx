import SimpleBarChart from "@/components/SimpleBarChart";
import SimpleLineChart from "@/components/SimpleLineChart";
import SimplePieChart from "@/components/SimplePieChart";
import ThemedScreen from "@/components/ThemedScreen";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { exportToCSV, exportToPDF } from "@/services/export";
import { getSpendingInsights, SpendingInsight } from "@/services/insights";
import { showError } from "@/utils/toast";
import { showChoice } from "@/components/AppDialog";
import { useCategoryStore } from "@/store/categoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { PieSegment } from "@/types";
import { getTotalExpenses, getTotalIncome } from "@/utils/calculateBudget";
import {
  formatYearMonth,
  getDaysInMonth,
  getYearMonth,
  nextMonth,
  prevMonth,
} from "@/utils/formatDate";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function ReportsScreen() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { selectedMonth, setSelectedMonth } = useSettingsStore();
  const theme = useThemeColors();
  const [exporting, setExporting] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => Number(selectedMonth.split('-')[0]));
  const { format } = useCurrency();
  const [insights, setInsights] = useState<SpendingInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const monthLabel = formatYearMonth(selectedMonth);

  const barChartData = (() => {
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
  const selectedYear = selectedMonth.split("-")[0];
  const yearMonths = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return `${selectedYear}-${m}`;
  });
  const yearData = yearMonths.map((ym) => {
    const inc = getTotalIncome(transactions, ym);
    const exp = getTotalExpenses(transactions, ym);
    return {
      label: new Date(
        Number(selectedYear),
        Number(ym.split("-")[1]) - 1,
        1,
      ).toLocaleString("en-US", { month: "short" }),
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  });
  const yearMaxVal = Math.max(
    ...yearData.map((d) => Math.max(d.income, d.expense)),
    1,
  );
  const totalSalary = getTotalIncome(transactions, selectedMonth);
  const totalExpenses = getTotalExpenses(transactions, selectedMonth);
  const net = totalSalary - totalExpenses;
  const totalBudget = categories.reduce((s, c) => s + (c.monthlyLimit ?? 0), 0);
  const pctSpent =
    totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0;

  // Daily spending line chart data
  const daysInMonth = getDaysInMonth(selectedMonth);
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          getYearMonth(t.date) === selectedMonth &&
          new Date(t.date).getDate() === day,
      )
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { day, amount: spent };
  }).filter((d) => d.amount > 0);

  // Top 3 spending categories
  const top3 = categories
    .filter((c) => c.spent > 0 && c.monthlyLimit !== null)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  // Pie segments from actual category spending
  const catSegments: PieSegment[] = categories
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4)
    .map((c) => ({
      name: c.name,
      percentage: Math.round((c.spent / (totalExpenses || 1)) * 100),
      color: c.color,
    }));

  // Normalize percentages to 100
  const totalPct = catSegments.reduce((s, c) => s + c.percentage, 0);
  const normalizedSegments: PieSegment[] = catSegments.map((s) => ({
    ...s,
    percentage: totalPct > 0 ? Math.round((s.percentage / totalPct) * 100) : 0,
  }));

  function handleExport() {
    showChoice("Export", "Choose format", [
      {
        label: "CSV",
        onPress: async () => {
          setExporting(true);
          try {
            await exportToCSV(transactions);
          } catch {
            showError("CSV export failed");
          } finally {
            setExporting(false);
          }
        },
      },
      {
        label: "PDF",
        onPress: async () => {
          setExporting(true);
          try {
            await exportToPDF(
              transactions,
              monthLabel,
              totalSalary,
              totalExpenses,
            );
          } catch {
            showError("PDF export failed");
          } finally {
            setExporting(false);
          }
        },
      },
    ]);
  }

  async function handleAIInsights() {
    setInsightsLoading(true);
    try {
      const result = await getSpendingInsights(
        transactions,
        categories,
        totalSalary,
        totalExpenses,
      );
      setInsights(result);
    } catch {
      showError("AI insights unavailable — add EXPO_PUBLIC_GROQ_API_KEY to .env");
    } finally {
      setInsightsLoading(false);
    }
  }

  return (
    <ThemedScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Reports
          </Text>
          <TouchableOpacity onPress={handleExport} disabled={exporting}>
            {exporting ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="download-outline" size={22} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>

        {/* Month nav */}
        <View style={styles.monthRow}>
          <TouchableOpacity
            onPress={() => setSelectedMonth(prevMonth(selectedMonth))}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setPickerYear(Number(selectedMonth.split('-')[0])); setShowMonthPicker(true); }}>
            <Text style={[styles.monthText, { color: theme.text }]}>
              {monthLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedMonth(nextMonth(selectedMonth))}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Spend summary */}
        <View style={[styles.card, styles.mx, { backgroundColor: theme.card }]}>
          <Text style={[styles.spentLabel, { color: theme.textSecondary }]}>
            You have Spent
          </Text>
          <Text style={[styles.spentAmount, { color: theme.text }]}>
            {format(totalExpenses)}
          </Text>
          <Text style={[styles.spentSub, { color: theme.textSecondary }]}>
            this month
          </Text>
          <View
            style={[styles.progressTrack, { backgroundColor: theme.border }]}
          >
            <View style={[styles.progressFill, { width: `${pctSpent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <View style={styles.progressLabelLeft}>
              <View
                style={[
                  styles.progressDot,
                  { backgroundColor: Colors.primary },
                ]}
              />
              <Text
                style={[styles.progressPct, { color: theme.textSecondary }]}
              >
                {pctSpent.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressLabelRight}>
              <Text
                style={[styles.progressPct, { color: theme.textSecondary }]}
              >
                {(100 - pctSpent).toFixed(1)}%
              </Text>
              <View
                style={[styles.progressDot, { backgroundColor: theme.border }]}
              />
            </View>
          </View>
        </View>

        {/* Summary row */}
        <View style={[styles.summaryRow, { backgroundColor: theme.card }]}>
          {[
            { label: "Income",   value: format(totalSalary),   icon: "arrow-down" as const,     color: Colors.success },
            { label: "Expenses", value: format(totalExpenses), icon: "arrow-up" as const,       color: Colors.danger },
            { label: "Net",      value: format(net),           icon: "wallet-outline" as const, color: net >= 0 ? Colors.success : Colors.danger },
          ].map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />}
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: item.color + "20" }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Daily line chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Daily Spending
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <SimpleLineChart data={dailyData} width={320} height={110} />
          </View>
        </View>

        {/* Pie chart */}
        {normalizedSegments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Spending by Category
            </Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <SimplePieChart segments={normalizedSegments} size={150} />
            </View>
          </View>
        )}

        {/* Top 3 categories */}
        {top3.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Top Spending Categories
            </Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {top3.map((cat, i) => {
                const pct = cat.monthlyLimit
                  ? Math.min((cat.spent / cat.monthlyLimit) * 100, 100)
                  : 0;
                return (
                  <View key={cat.id}>
                    {i > 0 && (
                      <View
                        style={[
                          top3Styles.divider,
                          { backgroundColor: theme.border },
                        ]}
                      />
                    )}
                    <View style={top3Styles.row}>
                      <View
                        style={[
                          top3Styles.icon,
                          { backgroundColor: cat.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={
                            getSafeIoniconName(cat.icon, "card") as IoniconsName
                          }
                          size={18}
                          color={cat.color}
                        />
                      </View>
                      <View style={top3Styles.info}>
                        <View style={top3Styles.labelRow}>
                          <Text
                            style={[top3Styles.name, { color: theme.text }]}
                          >
                            {cat.name}
                          </Text>
                          <Text
                            style={[top3Styles.amount, { color: cat.color }]}
                          >
                            {format(cat.spent)}
                          </Text>
                        </View>
                        <View
                          style={[
                            top3Styles.track,
                            { backgroundColor: theme.border },
                          ]}
                        >
                          <View
                            style={[
                              top3Styles.fill,
                              {
                                width: `${pct}%` as any,
                                backgroundColor: cat.color,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            top3Styles.sub,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {pct.toFixed(0)}% of {format(cat.monthlyLimit ?? 0)}{" "}
                          budget
                        </Text>
                      </View>
                      <View
                        style={[
                          top3Styles.rank,
                          { backgroundColor: cat.color + "20" },
                        ]}
                      >
                        <Text
                          style={[top3Styles.rankText, { color: cat.color }]}
                        >
                          #{i + 1}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bar chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6-Month Comparison
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <SimpleBarChart data={barChartData} maxHeight={100} />
          </View>
        </View>

        {/* Year at a Glance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Year at a Glance — {selectedYear}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {yearData.map((d) => (
              <View key={d.label} style={yearStyles.row}>
                <Text
                  style={[yearStyles.month, { color: theme.textSecondary }]}
                >
                  {d.label}
                </Text>
                <View style={yearStyles.bars}>
                  <View
                    style={[
                      yearStyles.barRow,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        yearStyles.bar,
                        yearStyles.incBar,
                        { width: `${(d.income / yearMaxVal) * 100}%` as any },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      yearStyles.barRow,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        yearStyles.bar,
                        yearStyles.expBar,
                        { width: `${(d.expense / yearMaxVal) * 100}%` as any },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    yearStyles.net,
                    { color: d.net >= 0 ? Colors.success : Colors.danger },
                  ]}
                >
                  {d.net === 0
                    ? "—"
                    : `${d.net >= 0 ? "+" : ""}${format(Math.abs(d.net))}`}
                </Text>
              </View>
            ))}
            <View style={[yearStyles.legend, { borderTopColor: theme.border }]}>
              <View style={yearStyles.legendItem}>
                <View
                  style={[
                    yearStyles.legendDot,
                    { backgroundColor: Colors.success },
                  ]}
                />
                <Text
                  style={[
                    yearStyles.legendLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Income
                </Text>
              </View>
              <View style={yearStyles.legendItem}>
                <View
                  style={[
                    yearStyles.legendDot,
                    { backgroundColor: Colors.danger },
                  ]}
                />
                <Text
                  style={[
                    yearStyles.legendLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Expenses
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            AI Spending Insights
          </Text>
          {insights ? (
            <View
              style={[styles.insightsCard, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.insightsSummary, { color: theme.text }]}>
                {insights.summary}
              </Text>
              <View
                style={[
                  styles.insightsDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <Text
                style={[
                  styles.insightsSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Tips
              </Text>
              {insights.tips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={[styles.tipText, { color: theme.text }]}>
                    {tip}
                  </Text>
                </View>
              ))}
              <View
                style={[
                  styles.insightsDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <Text style={styles.savingsOpp}>
                {insights.savingsOpportunity}
              </Text>
              <TouchableOpacity
                onPress={() => setInsights(null)}
                style={styles.refreshBtn}
              >
                <Ionicons name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={handleAIInsights}
              disabled={insightsLoading}
            >
              {insightsLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={Colors.white} />
                  <Text style={styles.aiBtnText}>
                    Analyze my spending with AI
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Month picker modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <View style={styles.mpOverlay}>
          <View style={[styles.mpCard, { backgroundColor: theme.card }]}>
            {/* Year row */}
            <View style={styles.mpYearRow}>
              <TouchableOpacity onPress={() => setPickerYear((y) => y - 1)}>
                <Ionicons name="chevron-back" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.mpYear, { color: theme.text }]}>{pickerYear}</Text>
              <TouchableOpacity onPress={() => setPickerYear((y) => y + 1)}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {/* Month grid */}
            <View style={styles.mpGrid}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => {
                const ym = `${pickerYear}-${String(i + 1).padStart(2, '0')}`;
                const active = ym === selectedMonth;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.mpCell, active && { backgroundColor: Colors.primary }]}
                    onPress={() => { setSelectedMonth(ym); setShowMonthPicker(false); }}
                  >
                    <Text style={[styles.mpCellText, { color: active ? Colors.white : theme.text }]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)} style={styles.mpClose}>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 140, gap: Spacing.three },
  mx: { marginHorizontal: Spacing.three },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  monthText: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 140,
    textAlign: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  spentLabel: { fontSize: 13 },
  spentAmount: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: Spacing.one,
  },
  spentSub: {
    fontSize: 12,
    marginBottom: Spacing.three,
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.two,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabelLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressLabelRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressPct: { fontSize: 12, fontWeight: "600" },
  summaryRow: {
    flexDirection: "column",
    marginHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  summaryDivider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { fontSize: 13, flex: 1 },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  section: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
  },
  aiBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  insightsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: Spacing.two,
  },
  insightsSummary: { fontSize: 14, lineHeight: 20 },
  insightsDivider: { height: 1 },
  insightsSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipRow: { flexDirection: "row", gap: Spacing.two },
  tipBullet: { color: Colors.primary, fontWeight: "700" },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  savingsOpp: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    fontStyle: "italic",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    alignSelf: "flex-end",
  },
  refreshText: { fontSize: 12, color: Colors.primary },
  mpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  mpCard: { width: '100%', borderRadius: BorderRadius.xl, padding: Spacing.four, gap: Spacing.three },
  mpYearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mpYear: { fontSize: 18, fontWeight: '700' },
  mpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  mpCell: { width: '30%', paddingVertical: Spacing.two, borderRadius: BorderRadius.md, alignItems: 'center' },
  mpCellText: { fontSize: 14, fontWeight: '600' },
  mpClose: { alignItems: 'center', paddingTop: Spacing.one },
});

const top3Styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: Spacing.two,
  },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  icon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 4 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 13, fontWeight: "600" },
  amount: { fontSize: 13, fontWeight: "700" },
  track: {
    height: 5,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: BorderRadius.full },
  sub: { fontSize: 10 },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 11, fontWeight: "800" },
});

const yearStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.one + 2,
    gap: Spacing.two,
  },
  month: {
    width: 28,
    fontSize: 11,
    fontWeight: "600",
  },
  bars: { flex: 1, gap: 3 },
  barRow: {
    height: 7,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  bar: { height: "100%", borderRadius: BorderRadius.full, minWidth: 2 },
  incBar: { backgroundColor: Colors.success },
  expBar: { backgroundColor: Colors.danger },
  net: { width: 52, fontSize: 11, fontWeight: "700", textAlign: "right" },
  legend: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: Spacing.one },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11 },
});
