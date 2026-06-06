import BudgetProgressCard from "@/components/BudgetProgressCard";
import ThemedScreen from "@/components/ThemedScreen";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { scheduleBudgetAlert } from "@/services/notifications";
import { useCategoryStore } from "@/store/categoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import {
  getBudgetStatus,
  getCategoryBudgetPct,
  getRolloverAmount,
} from "@/utils/calculateBudget";
import { prevMonth } from "@/utils/formatDate";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { showConfirm } from "@/components/AppDialog";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const SWIPE_THRESHOLD = 72;

function SwipeableBudgetCard({
  children,
  onEdit,
  onDelete,
}: Readonly<{ children: React.ReactNode; onEdit: () => void; onDelete: () => void }>) {
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
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={swipe.label}>Edit</Text>
      </View>
      <View style={swipe.rightAction}>
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={swipe.label}>Delete</Text>
      </View>
      <Animated.View style={{ transform: [{ translateX }], backgroundColor: theme.card }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const swipe = StyleSheet.create({
  container: { position: "relative", overflow: "hidden", borderRadius: BorderRadius.lg },
  leftAction: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", gap: 4,
  },
  rightAction: {
    position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center", gap: 4,
  },
  label: { color: "#fff", fontSize: 11, fontWeight: "700" },
});

export default function BudgetsScreen() {
  const { categories, archiveCategory } = useCategoryStore();
  const { getTotalByType, transactions } = useTransactionStore();
  const { notifications, budgetRollover, selectedMonth } = useSettingsStore();
  const theme = useThemeColors();
  const { format } = useCurrency();

  const totalMonthlyBudget = categories
    .filter((c) => !c.archived && c.monthlyLimit !== null)
    .reduce((sum, c) => sum + (c.monthlyLimit ?? 0), 0);

  const totalSpent = getTotalByType("expense", selectedMonth);
  const prevYM = prevMonth(selectedMonth);
  const totalPct = totalMonthlyBudget > 0 ? Math.min((totalSpent / totalMonthlyBudget) * 100, 100) : 0;
  const status = getBudgetStatus(totalPct);

  let statusColor: string = Colors.success;
  if (status === "danger") statusColor = Colors.danger;
  else if (status === "warning") statusColor = Colors.secondary;

  const { updateCategory } = useCategoryStore();
  const activeCategories = categories.filter(
    (c) => !c.archived && c.monthlyLimit !== null,
  );

  const [editModal, setEditModal] = useState<{ catId: string; catName: string; value: string } | null>(null);

  function handleEditLimit(catId: string, catName: string, currentLimit: number) {
    setEditModal({ catId, catName, value: currentLimit.toString() });
  }

  function handleSaveLimit() {
    if (!editModal) return;
    const parsed = Number.parseFloat(editModal.value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      updateCategory(editModal.catId, { monthlyLimit: parsed });
    }
    setEditModal(null);
  }

  // Fire budget alert notifications when a category crosses 80% or 100%
  useEffect(() => {
    if (!notifications) return;
    for (const cat of activeCategories) {
      const pct = getCategoryBudgetPct(cat);
      if (pct >= 80) {
        scheduleBudgetAlert(cat.name, pct).catch(() => {
          /* permission not granted */
        });
      }
    }
  }, [activeCategories, notifications]);

  return (
    <ThemedScreen>
      {/* Edit budget limit modal */}
      <Modal visible={editModal !== null} transparent animationType="fade" onRequestClose={() => setEditModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Budget Limit</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Monthly limit for {editModal?.catName}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
              value={editModal?.value ?? ''}
              onChangeText={(v) => setEditModal((m) => m ? { ...m, value: v } : m)}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={() => setEditModal(null)}>
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveLimit}>
                <Text style={[styles.modalBtnText, { color: Colors.white }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Budgets
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/modals/add-category")}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Total budget card */}
        <View style={[styles.totalCard, { backgroundColor: theme.card }]}>
          <View style={styles.totalRow}>
            <View>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                Monthly Budget
              </Text>
              <Text style={[styles.totalAmount, { color: theme.text }]}>
                {format(totalMonthlyBudget)}
              </Text>
            </View>
            <View
              style={[
                styles.totalBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Text style={[styles.totalBadgeText, { color: statusColor }]}>
                {totalPct.toFixed(0)}% used
              </Text>
            </View>
          </View>

          <View style={[styles.totalTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.totalFill,
                { width: `${totalPct}%` as any, backgroundColor: statusColor },
              ]}
            />
          </View>

          <View style={styles.totalFooter}>
            <Text style={[styles.totalSub, { color: theme.textSecondary }]}>
              <Text style={{ color: Colors.danger }}>
                {format(totalSpent)} spent
              </Text>
              {"  ·  "}
              <Text style={{ color: Colors.success }}>
                {format(totalMonthlyBudget - totalSpent)} remaining
              </Text>
            </Text>
          </View>
        </View>

        {/* Alert banner */}
        {status !== "safe" && (
          <View
            style={[
              styles.alertBanner,
              {
                backgroundColor: statusColor + "15",
                borderColor: statusColor + "40",
              },
            ]}
          >
            <Ionicons
              name={status === "danger" ? "warning" : "alert-circle"}
              size={16}
              color={statusColor}
            />
            <Text style={[styles.alertText, { color: statusColor }]}>
              {status === "danger"
                ? "You have exceeded your monthly budget!"
                : "You are approaching your monthly budget limit."}
            </Text>
          </View>
        )}

        {/* Category budgets */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Category Budgets
          </Text>
          {activeCategories.map((cat) => (
            <SwipeableBudgetCard
              key={cat.id}
              onEdit={() => handleEditLimit(cat.id, cat.name, cat.monthlyLimit ?? 0)}
              onDelete={() =>
                showConfirm({
                  title: 'Remove Budget',
                  message: `Remove budget limit for "${cat.name}"?`,
                  confirmLabel: 'Remove',
                  destructive: true,
                  onConfirm: () => archiveCategory(cat.id),
                })
              }
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/(tabs)/transactions?categoryId=${cat.id}`)}
              >
                <BudgetProgressCard
                  category={cat}
                  rolloverAmount={budgetRollover ? getRolloverAmount(cat, transactions, prevYM) : 0}
                />
              </TouchableOpacity>
            </SwipeableBudgetCard>
          ))}
        </View>

        {/* No-limit categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Uncapped Categories
          </Text>
          <View style={[styles.uncappedCard, { backgroundColor: theme.card }]}>
            {categories
              .filter((c) => !c.archived && c.monthlyLimit === null)
              .map((cat, i, arr) => (
                <View key={cat.id}>
                  <View style={styles.uncappedRow}>
                    <View
                      style={[
                        styles.uncappedIcon,
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
                    <Text style={[styles.uncappedName, { color: theme.text }]}>
                      {cat.name}
                    </Text>
                    <Text
                      style={[
                        styles.uncappedNote,
                        { color: theme.textSecondary },
                      ]}
                    >
                      No limit set
                    </Text>
                  </View>
                  {i < arr.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
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
  content: { paddingBottom: 140, gap: Spacing.three },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginHorizontal: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.three,
  },
  totalLabel: {
    fontSize: 13,
    marginBottom: Spacing.one,
  },
  totalAmount: { fontSize: 26, fontWeight: "800" },
  totalBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
  },
  totalBadgeText: { fontSize: 12, fontWeight: "700" },
  totalTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.two,
  },
  totalFill: { height: "100%", borderRadius: BorderRadius.full },
  totalFooter: {},
  totalSub: { fontSize: 13 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    padding: Spacing.two + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  alertText: { fontSize: 13, fontWeight: "500", flex: 1 },
  section: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  uncappedCard: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  uncappedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
  },
  uncappedIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  uncappedName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  uncappedNote: { fontSize: 12 },
  divider: { height: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  modalCard: { width: '100%', borderRadius: BorderRadius.xl, padding: Spacing.four, gap: Spacing.two },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSub: { fontSize: 13 },
  modalInput: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  modalBtn: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: Spacing.two + 2, alignItems: 'center' },
  modalBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
});
