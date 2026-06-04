import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedScreen from '@/components/ThemedScreen';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import BudgetProgressCard from '@/components/BudgetProgressCard';
import TransactionItem from '@/components/TransactionItem';
import { getTotalIncome, getTotalExpenses, getRolloverAmount } from '@/utils/calculateBudget';
import { useCurrency } from '@/hooks/useCurrency';
import { formatYearMonth, prevMonth, nextMonth, getYearMonth } from '@/utils/formatDate';

function getWeekAround(ym: string, anchorDay = 15, weekStartsOn: 0 | 1 = 0): { dates: number[]; active: number; days: string[] } {
  const [y, m] = ym.split('-').map(Number);
  const anchor = new Date(y, m - 1, anchorDay);
  const dow = anchor.getDay();
  const offset = ((dow - weekStartsOn) + 7) % 7;
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - offset);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.getDate();
  });
  const allDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = Array.from({ length: 7 }, (_, i) => allDays[(weekStartsOn + i) % 7]);
  return { dates, active: anchorDay, days };
}

export default function ExpensesScreen() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { selectedMonth, setSelectedMonth, budgetRollover, weekStartsOn } = useSettingsStore();
  const theme = useThemeColors();
  const { format } = useCurrency();
  const prevYM = prevMonth(selectedMonth);
  const totalSalary = getTotalIncome(transactions, selectedMonth);
  const totalExpenses = getTotalExpenses(transactions, selectedMonth);
  const expenses = transactions.filter((t) => t.type === 'expense' && getYearMonth(t.date) === selectedMonth);
  const { dates: DATES, active: ACTIVE_DATE, days: WEEK_DAYS } = getWeekAround(selectedMonth, 15, weekStartsOn);

  return (
    <ThemedScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Expenses</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Month selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setSelectedMonth(prevMonth(selectedMonth))}>
            <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>{formatYearMonth(selectedMonth)}</Text>
          <TouchableOpacity onPress={() => setSelectedMonth(nextMonth(selectedMonth))}>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Week calendar */}
        <View style={styles.calendar}>
          {WEEK_DAYS.map((d, i) => (
            <View key={d} style={styles.dayCol}>
              <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{d}</Text>
              <TouchableOpacity
                style={[styles.dateBtn, DATES[i] === ACTIVE_DATE && styles.dateBtnActive]}>
                <Text
                  style={[styles.dateText, { color: theme.text }, DATES[i] === ACTIVE_DATE && styles.dateTextActive]}>
                  {DATES[i]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardLight, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Salary</Text>
            <Text style={[styles.summaryAmount, { color: theme.text }]}>
              {format(totalSalary)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardDark]}>
            <Text style={[styles.summaryLabel, styles.summaryLabelLight]}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, styles.summaryAmountLight]}>
              {format(totalExpenses)}
            </Text>
          </View>
        </View>

        {/* Budget by category */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget Overview</Text>
          {categories.map((cat) => (
            <BudgetProgressCard
              key={cat.id}
              category={cat}
              rolloverAmount={budgetRollover ? getRolloverAmount(cat, transactions, prevYM) : 0}
            />
          ))}
        </View>

        {/* Expense transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transactions</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {expenses.map((tx, i) => (
              <View key={tx.id}>
                <TransactionItem transaction={tx} />
                {i < expenses.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 140, gap: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  dayCol: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dateBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtnActive: {
    backgroundColor: Colors.secondary,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  dateTextActive: {
    color: Colors.white,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryCardLight: {
    backgroundColor: Colors.white,
  },
  summaryCardDark: {
    backgroundColor: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.one,
  },
  summaryLabelLight: {
    color: 'rgba(255,255,255,0.75)',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryAmountLight: {
    color: Colors.white,
  },
  section: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
