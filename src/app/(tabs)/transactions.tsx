import { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SectionList, ScrollView, Modal, Animated,
  PanResponder, RefreshControl, TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import ThemedScreen from '@/components/ThemedScreen';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useTransactionStore } from '@/store/transactionStore';
import { useAccountStore } from '@/store/accountStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import TransactionItem from '@/components/TransactionItem';
import { formatShortDate, prevMonth, getYearMonth } from '@/utils/formatDate';
import { Transaction } from '@/types';
import { showConfirm } from '@/components/AppDialog';
import { showError } from '@/utils/toast';

type FilterType = 'all' | 'income' | 'expense';
type DateRange = 'all' | 'this-month' | 'last-month' | '3-months';

const SWIPE_THRESHOLD = 72;

function SwipeableRow({
  onDelete,
  onEdit,
  children,
}: Readonly<{ onDelete: () => void; onEdit: () => void; children: React.ReactNode }>) {
  const theme = useThemeColors();
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
      onPanResponderMove: (_, { dx }) =>
        translateX.setValue(Math.max(-110, Math.min(110, dx))),
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: -500, duration: 200, useNativeDriver: true }).start(() => {
            translateX.setValue(0);
            onDelete();
          });
        } else if (dx > SWIPE_THRESHOLD) {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(() => onEdit());
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={swipe.container}>
      <View style={swipe.leftAction}>
        <Ionicons name="pencil" size={18} color={Colors.white} />
        <Text style={swipe.actionLabel}>Edit</Text>
      </View>
      <View style={swipe.rightAction}>
        <Ionicons name="trash" size={18} color={Colors.white} />
        <Text style={swipe.actionLabel}>Delete</Text>
      </View>
      <Animated.View style={{ transform: [{ translateX }], backgroundColor: theme.card }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

function navigateToEdit(item: Transaction) {
  router.push(`/modals/add-transaction?txId=${item.id}`);
}

function SectionSeparator() {
  return <View style={styles.sectionGap} />;
}

function groupByDate(txs: Transaction[]): { title: string; total: number; data: Transaction[] }[] {
  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, Transaction[]>();
  for (const tx of sorted) {
    const key = tx.date.split('T')[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, data]) => ({
    title: formatShortDate(date),
    total: data.reduce((s, t) => s + t.amount, 0),
    data,
  }));
}

export default function TransactionsScreen() {
  const { transactions, deleteTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { selectedMonth } = useSettingsStore();
  const { categoryId: catParam } = useLocalSearchParams<{ categoryId?: string }>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const activeFilterCount = (dateRange !== 'all' ? 1 : 0) + (accountFilter !== 'all' ? 1 : 0);
  const theme = useThemeColors();
  const { format } = useCurrency();

  const filtered = useMemo(() => {
    const prevMon = prevMonth(selectedMonth);
    const threeMonthsAgo = prevMonth(prevMon);
    return transactions.filter((tx) => {
      const matchType = filter === 'all' || tx.type === filter;
      const matchCat = !catParam || tx.categoryId === catParam;
      const matchAccount = accountFilter === 'all' || tx.accountId === accountFilter;
      const txYM = getYearMonth(tx.date);
      const matchDate =
        dateRange === 'all' ||
        (dateRange === 'this-month' && txYM === selectedMonth) ||
        (dateRange === 'last-month' && txYM === prevMon) ||
        (dateRange === '3-months' && txYM >= threeMonthsAgo && txYM <= selectedMonth);
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.note.toLowerCase().includes(q);
      return matchType && matchCat && matchAccount && matchDate && matchSearch;
    });
  }, [transactions, filter, search, catParam, accountFilter, dateRange, selectedMonth]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  function confirmDelete(id: string, merchant: string) {
    showConfirm({
      title: 'Delete Transaction',
      message: `Remove "${merchant}"?`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try { await deleteTransaction(id); }
        catch { showError('Failed to delete. Check your connection and try again.'); }
      },
    });
  }

  return (
    <ThemedScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? Colors.primary : theme.text} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/modals/add-transaction')}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
          placeholderTextColor={theme.textSecondary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter banner */}
      {catParam && (
        <View style={styles.catBanner}>
          <Text style={styles.catBannerText}>Filtered: {filtered[0]?.category ?? catParam}</Text>
          <TouchableOpacity onPress={() => router.setParams({ categoryId: undefined })}>
            <Ionicons name="close-circle" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Active filter summary — only shows when filters applied */}
      {(activeFilterCount > 0 || filter !== 'all') && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContent}>
            {filter !== 'all' && (
              <View style={[styles.activeChip, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.activeChipText}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                <TouchableOpacity onPress={() => setFilter('all')}><Ionicons name="close" size={11} color={Colors.primary} /></TouchableOpacity>
              </View>
            )}
            {dateRange !== 'all' && (
              <View style={[styles.activeChip, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.activeChipText}>{dateRange === 'this-month' ? 'This Month' : dateRange === 'last-month' ? 'Last Month' : '3 Months'}</Text>
                <TouchableOpacity onPress={() => setDateRange('all')}><Ionicons name="close" size={11} color={Colors.primary} /></TouchableOpacity>
              </View>
            )}
            {accountFilter !== 'all' && (
              <View style={[styles.activeChip, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.activeChipText}>{accounts.find(a => a.id === accountFilter)?.name ?? accountFilter}</Text>
                <TouchableOpacity onPress={() => setAccountFilter('all')}><Ionicons name="close" size={11} color={Colors.primary} /></TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Filter sheet */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setFilterOpen(false)}>
          <View style={sheet.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[sheet.panel, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[sheet.handle, { backgroundColor: theme.border }]} />
          <View style={[sheet.header, { borderBottomColor: theme.border }]}>
            <Text style={[sheet.title, { color: theme.text }]}>Filters</Text>
            <TouchableOpacity onPress={() => { setDateRange('all'); setAccountFilter('all'); }}>
              <Text style={sheet.reset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={sheet.content}>
            <Text style={[sheet.sectionLabel, { color: theme.textSecondary }]}>Date Range</Text>
            <View style={sheet.row}>
              {([['all', 'All Time'], ['this-month', 'This Month'], ['last-month', 'Last Month'], ['3-months', '3 Months']] as [DateRange, string][]).map(([val, label]) => (
                <TouchableOpacity
                  key={val}
                  style={[sheet.chip, { backgroundColor: theme.input, borderColor: theme.border }, dateRange === val && sheet.chipActive]}
                  onPress={() => setDateRange(val)}>
                  <Text style={[sheet.chipText, { color: theme.textSecondary }, dateRange === val && sheet.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {accounts.length > 0 && (
              <>
                <Text style={[sheet.sectionLabel, { color: theme.textSecondary }]}>Account</Text>
                <View style={sheet.row}>
                  <TouchableOpacity
                    style={[sheet.chip, { backgroundColor: theme.input, borderColor: theme.border }, accountFilter === 'all' && sheet.chipActive]}
                    onPress={() => setAccountFilter('all')}>
                    <Text style={[sheet.chipText, { color: theme.textSecondary }, accountFilter === 'all' && sheet.chipTextActive]}>All</Text>
                  </TouchableOpacity>
                  {accounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[sheet.chip, { backgroundColor: theme.input, borderColor: theme.border }, accountFilter === acc.id && { backgroundColor: acc.color, borderColor: acc.color }]}
                      onPress={() => setAccountFilter(acc.id)}>
                      <Text style={[sheet.chipText, { color: theme.textSecondary }, accountFilter === acc.id && sheet.chipTextActive]}>{acc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={sheet.applyBtn} onPress={() => setFilterOpen(false)}>
            <Text style={sheet.applyText}>Apply{activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{section.title}</Text>
            <Text style={[styles.sectionTotal, { color: section.total >= 0 ? Colors.success : Colors.danger }]}>
              {section.total >= 0 ? '+' : '-'}{format(Math.abs(section.total))}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={[styles.cardWrapper, { backgroundColor: theme.card }]}>
            <SwipeableRow
              onDelete={() => confirmDelete(item.id, item.merchant)}
              onEdit={() => navigateToEdit(item)}>
              <TransactionItem transaction={item} />
            </SwipeableRow>
            {index < section.data.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
          </View>
        )}
        SectionSeparatorComponent={SectionSeparator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={40} color={theme.textSecondary} style={{ marginBottom: Spacing.two }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transactions found</Text>
          </View>
        }
      />
    </ThemedScreen>
  );
}

const swipe = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  leftAction: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  rightAction: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  actionLabel: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});

const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: Spacing.two,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
    maxHeight: '75%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.two },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '700' },
  reset: { fontSize: 13, color: Colors.danger, fontWeight: '600' },
  content: { padding: Spacing.three, gap: Spacing.three },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: -Spacing.one },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  applyBtn: {
    marginHorizontal: Spacing.three, marginTop: Spacing.two,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.two + 4, alignItems: 'center',
  },
  applyText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  filterBtn: { position: 'relative', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBadge: {
    position: 'absolute', top: 2, right: 2, width: 16, height: 16,
    borderRadius: 8, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  addBtn: {
    backgroundColor: Colors.primary, width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, marginHorizontal: Spacing.three,
    paddingHorizontal: Spacing.two + 2, height: 44,
    borderWidth: 1, marginBottom: Spacing.two,
  },
  searchIcon: { marginRight: Spacing.one },
  searchInput: { flex: 1, fontSize: 14 },
  filtersScroll: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.one + 2,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
  },
  pill: {
    paddingHorizontal: Spacing.two + 2, paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  pillTextActive: { color: Colors.white },
  catBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary + '18', borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2,
  },
  catBannerText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  list: { paddingHorizontal: Spacing.three, paddingBottom: 140 },
  sectionHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.one, marginTop: Spacing.two,
  },
  sectionHeader: {
    fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionTotal: { fontSize: 12, fontWeight: '700' },
  cardWrapper: {
    borderRadius: BorderRadius.lg,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    overflow: 'hidden',
  },
  divider: { height: 1 },
  sectionGap: { height: Spacing.two },
  empty: { alignItems: 'center', paddingTop: Spacing.six },

  emptyText: { fontSize: 15 },
  activeFiltersRow: { paddingHorizontal: Spacing.three, marginBottom: Spacing.one + 2 },
  activeFiltersContent: { flexDirection: 'row', gap: Spacing.one + 2 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.two, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activeChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
});
