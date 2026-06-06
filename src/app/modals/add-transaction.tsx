import { SafeAreaView } from "react-native-safe-area-context";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAccountStore } from "@/store/accountStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { getCurrencySymbol, LOCALE_MAP } from "@/utils/formatCurrency";
import { RecurrenceFrequency, TransactionType } from "@/types";
import { todayStr } from "@/utils/formatDate";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { showError } from "@/utils/toast";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_LABEL = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CustomDatePicker({ visible, value, onConfirm, onClose }: {
  visible: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}) {
  const theme = useThemeColors();
  const parsed = new Date(value);
  const initYear  = isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear();
  const initMonth = isNaN(parsed.getTime()) ? new Date().getMonth()    : parsed.getMonth();
  const initDay   = isNaN(parsed.getTime()) ? new Date().getDate()     : parsed.getDate();

  const [year, setYear]   = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [day, setDay]     = useState(initDay);

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setDay(1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setDay(1);
  }

  function confirm() {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onConfirm(`${year}-${mm}-${dd}`);
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <View style={[dp.card, { backgroundColor: theme.card }]}>
          {/* Month/Year nav */}
          <View style={dp.navRow}>
            <TouchableOpacity onPress={prevMonth} style={dp.navBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[dp.navTitle, { color: theme.text }]}>
              {MONTHS[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={dp.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Day-of-week headers */}
          <View style={dp.weekRow}>
            {DAYS_LABEL.map((d) => (
              <Text key={d} style={[dp.weekLabel, { color: theme.textSecondary }]}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={dp.grid}>
            {cells.map((d, i) => {
              const active = d === day;
              return (
                <TouchableOpacity
                  key={i}
                  style={dp.cell}
                  onPress={() => d && setDay(d)}
                  disabled={!d}
                >
                  {d !== null && (
                    <View style={[dp.cellInner, active && { backgroundColor: theme.primary }]}>
                      <Text style={[dp.cellText, { color: active ? '#fff' : theme.text }]}>{d}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={dp.actions}>
            <TouchableOpacity style={[dp.actionBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={[dp.actionText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[dp.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={confirm}>
              <Text style={[dp.actionText, { color: '#fff' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  card: { width: '100%', borderRadius: BorderRadius.xl, padding: Spacing.three, gap: Spacing.two },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.one },
  navBtn: { padding: Spacing.two },
  navTitle: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row' },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', paddingVertical: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellInner: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: Spacing.two + 2, alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '600' },
});

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];



export default function AddTransactionModal() {
  const theme = useThemeColors();
  const { currency } = useSettingsStore();
  const currencySymbol = getCurrencySymbol(currency);
  const { txId } = useLocalSearchParams<{ txId?: string }>();
  const { transactions, addTransaction, updateTransaction } =
    useTransactionStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();

  const existing = txId ? transactions.find((t) => t.id === txId) : undefined;

  const [type, setType] = useState<TransactionType>(
    existing?.type ?? "expense",
  );
  // rawAmount stores digits only; displayAmount formats with locale thousands separator
  const [rawAmount, setRawAmount] = useState(
    existing ? Math.abs(existing.amount).toString() : "",
  );
  const locale = LOCALE_MAP[currency] ?? 'en-US';
  const displayAmount = rawAmount
    ? new Intl.NumberFormat(locale).format(Number(rawAmount))
    : '';
  const amountFontSize = Math.max(22, 48 - Math.max(0, displayAmount.length - 5) * 3);
  function handleAmountChange(text: string) {
    setRawAmount(text.replace(/[^0-9]/g, ''));
  }
  const [note, setNote] = useState(existing?.note ?? "");
  const [merchant, setMerchant] = useState(existing?.merchant ?? "");
  const [selectedCat, setSelectedCat] = useState(
    existing?.categoryId ?? categories.find((c) => !c.archived)?.id ?? '',
  );
  const [selectedAccount, setSelectedAccount] = useState(
    existing?.accountId ?? accounts[0]?.id ?? '',
  );
  const [date, setDate] = useState(existing?.date ?? todayStr());
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    existing?.recurrence?.frequency ?? "monthly",
  );

  const activeCategories = categories.filter((c) => !c.archived);

  function adjustDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  }

  async function handleSave() {
    const parsed = Number.parseFloat(rawAmount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      showError("Enter a valid amount");
      return;
    }
    if (!merchant.trim()) {
      showError("Please enter a merchant or description");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      showError("Invalid date — use YYYY-MM-DD format");
      return;
    }

    const cat = activeCategories.find((c) => c.id === selectedCat);
    const finalAmount = type === "expense" ? -parsed : parsed;
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const recurrence = recurring ? { frequency, nextDate: date } : null;

    try {
      if (existing) {
        await updateTransaction(existing.id, {
          merchant: merchant.trim(),
          amount: finalAmount,
          type,
          categoryId: selectedCat,
          category: cat?.name ?? "",
          accountId: selectedAccount,
          note,
          tags: parsedTags,
          date,
          icon: cat?.icon ?? existing.icon,
          iconBg: cat?.color ?? existing.iconBg,
          recurring,
          recurrence,
        });
      } else {
        await addTransaction({
          merchant: merchant.trim(),
          amount: finalAmount,
          type,
          categoryId: selectedCat,
          category: cat?.name ?? "",
          accountId: selectedAccount,
          note,
          tags: parsedTags,
          date,
          icon: cat?.icon ?? (type === "income" ? "cash" : "card"),
          iconBg: cat?.color ?? Colors.primary,
          recurring,
          recurrence,
        });
      }
      router.back();
    } catch {
      showError("Failed to save. Check your connection and try again.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.card, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {existing ? "Edit Transaction" : "Add Transaction"}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type toggle */}
          <View
            style={[
              styles.typeToggle,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "expense" && styles.typeBtnActive,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: theme.textSecondary },
                  type === "expense" && styles.typeBtnTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "income" && styles.typeBtnActiveGreen,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: theme.textSecondary },
                  type === "income" && styles.typeBtnTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: theme.textSecondary }]}>
              {currencySymbol}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text, fontSize: amountFontSize }]}
              value={displayAmount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          {/* Merchant */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Description / Merchant
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="e.g. Starbucks"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Date
            </Text>
            <View
              style={[
                styles.dateRow,
                { backgroundColor: theme.input, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => adjustDate(-1)}
                style={styles.dateArrow}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateDisplay} onPress={() => setShowDatePicker(true)}>
                <Text style={[styles.dateInput, { color: theme.text }]}>{date}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustDate(1)}
                style={styles.dateArrow}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Note */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Note (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Tags (comma-separated)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. food, work, travel"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.catScroll}
            >
              {activeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    selectedCat === cat.id && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setSelectedCat(cat.id)}
                >
                  <Ionicons
                    name={getSafeIoniconName(cat.icon, "card") as IoniconsName}
                    size={14}
                    color={
                      selectedCat === cat.id
                        ? Colors.white
                        : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.catLabel,
                      { color: theme.text },
                      selectedCat === cat.id && styles.catLabelActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Account */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Account
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.catScroll}
            >
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    selectedAccount === acc.id && {
                      backgroundColor: acc.color,
                      borderColor: acc.color,
                    },
                  ]}
                  onPress={() => setSelectedAccount(acc.id)}
                >
                  <Text
                    style={[
                      styles.catLabel,
                      { color: theme.text },
                      selectedAccount === acc.id && styles.catLabelActive,
                    ]}
                  >
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recurring */}
          <View
            style={[
              styles.recurringRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.recurringLeft}>
              <Ionicons name="repeat" size={18} color={Colors.primary} />
              <Text style={[styles.recurringLabel, { color: theme.text }]}>
                Recurring
              </Text>
            </View>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {recurring && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Frequency
              </Text>
              <View style={styles.freqRow}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    style={[
                      styles.freqChip,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                      frequency === f.value && {
                        backgroundColor: Colors.primary,
                        borderColor: Colors.primary,
                      },
                    ]}
                    onPress={() => setFrequency(f.value)}
                  >
                    <Text
                      style={[
                        styles.freqLabel,
                        { color: theme.textSecondary },
                        frequency === f.value && styles.freqLabelActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <CustomDatePicker
          visible={showDatePicker}
          value={date}
          onConfirm={(d) => { setDate(d); setShowDatePicker(false); }}
          onClose={() => setShowDatePicker(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  saveBtn: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  content: { padding: Spacing.three, gap: Spacing.three },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  typeBtnActive: { backgroundColor: Colors.danger },
  typeBtnActiveGreen: { backgroundColor: Colors.success },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.white },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.four,
  },
  currency: {
    fontSize: 32,
    fontWeight: "300",
    color: Colors.textSecondary,
    marginRight: Spacing.one,
  },
  amountInput: {
    fontWeight: "700",
    minWidth: 80,
    flexShrink: 1,
    textAlign: "center",
  },
  field: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateArrow: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two + 4,
  },
  dateDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dateInput: {
    fontSize: 15,
    textAlign: "center",
  },
  catScroll: { marginTop: Spacing.one },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.two,
  },
  catLabel: { fontSize: 13, fontWeight: "500", color: Colors.textPrimary },
  catLabelActive: { color: Colors.white },
  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recurringLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  recurringLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  freqRow: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
  freqChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  freqLabelActive: { color: Colors.white },
});
