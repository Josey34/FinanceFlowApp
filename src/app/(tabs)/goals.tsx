import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { showConfirm, showInput } from '@/components/AppDialog';
import { showError } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ThemedScreen from '@/components/ThemedScreen';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useGoalStore } from '@/store/goalStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { Goal } from '@/types';
import ConfettiAnimation from '@/components/ConfettiAnimation';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface RingProps {
  pct: number;
  color: string;
  size?: number;
}

function ProgressRing({ pct, color, size = 64 }: Readonly<RingProps>) {
  const theme = useThemeColors();
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const cx = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} stroke={theme.border} strokeWidth={6} fill="none" />
      <Circle
        cx={cx} cy={cx} r={r}
        stroke={color} strokeWidth={6} fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx},${cx}`}
      />
    </Svg>
  );
}

interface GoalCardProps {
  goal: Goal;
  onContribute: (id: string) => void;
  onDelete: (id: string) => void;
}

function GoalCard({ goal, onContribute, onDelete }: Readonly<GoalCardProps>) {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.savedAmount;
  const daysLeft = goal.deadline
    ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <View style={[styles.goalCard, { backgroundColor: theme.card }, goal.completed && styles.goalCardDone]}>
      {goal.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✓ Completed!</Text>
        </View>
      )}
      <View style={styles.goalRow}>
        <ProgressRing pct={pct} color={goal.color} />
        <View style={styles.goalInfo}>
          <View style={styles.goalHeader}>
            <View style={[styles.goalIconWrap, { backgroundColor: goal.color + '20' }]}>
              <Ionicons name={goal.icon as IoniconsName} size={16} color={goal.color} />
            </View>
            <Text style={[styles.goalName, { color: theme.text }]}>{goal.name}</Text>
          </View>
          <Text style={styles.goalAmounts}>
            <Text style={{ color: goal.color, fontWeight: '700' }}>
              {format(goal.savedAmount)}
            </Text>
            <Text style={[styles.goalTarget, { color: theme.textSecondary }]}> / {format(goal.targetAmount)}</Text>
          </Text>
          {!goal.completed && (
            <Text style={[styles.goalSub, { color: theme.textSecondary }]}>
              {format(remaining)} to go
              {daysLeft !== null ? `  ·  ${daysLeft}d left` : ''}
            </Text>
          )}
        </View>
        <View style={styles.goalActions}>
          {!goal.completed && (
            <TouchableOpacity
              style={[styles.contributeBtn, { backgroundColor: goal.color }]}
              onPress={() => onContribute(goal.id)}>
              <Ionicons name="add" size={18} color={Colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(goal.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: goal.color }]} />
      </View>
      <Text style={[styles.pctLabel, { color: theme.textSecondary }]}>{pct.toFixed(0)}% saved</Text>
    </View>
  );
}

export default function GoalsScreen() {
  const { goals, deleteGoal, contributeToGoal } = useGoalStore();
  const theme = useThemeColors();
  const { format } = useCurrency();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompletedIds = useRef(new Set(goals.filter((g) => g.completed).map((g) => g.id)));

  useEffect(() => {
    const newlyDone = goals.filter((g) => g.completed && !prevCompletedIds.current.has(g.id));
    if (newlyDone.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    prevCompletedIds.current = new Set(goals.filter((g) => g.completed).map((g) => g.id));
  }, [goals]);

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  function handleContribute(id: string) {
    showInput({
      title: 'Add Funds',
      message: 'How much are you adding to this goal?',
      placeholder: '0.00',
      keyboardType: 'decimal-pad',
      onConfirm: async (value) => {
        const amount = Number.parseFloat(value);
        if (amount <= 0) return;
        try {
          await contributeToGoal(id, amount);
        } catch {
          showError('Failed to save. Check your connection and try again.');
        }
      },
    });
  }

  function handleDelete(id: string) {
    showConfirm({
      title: 'Delete Goal',
      message: 'Remove this savings goal?',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try { await deleteGoal(id); }
        catch { showError('Failed to delete. Check your connection and try again.'); }
      },
    });
  }

  return (
    <ThemedScreen>
      <ConfettiAnimation visible={showConfetti} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Savings Goals</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/modals/add-goal')}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Saved</Text>
            <Text style={[styles.summaryAmt, { color: Colors.success }]}>
              {format(totalSaved)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Target</Text>
            <Text style={[styles.summaryAmt, { color: Colors.primary }]}>
              {format(totalTarget)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Goals</Text>
            <Text style={[styles.summaryAmt, { color: theme.text }]}>
              {completed.length}/{goals.length}
            </Text>
          </View>
        </View>

        {/* Active goals */}
        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active ({active.length})</Text>
            {active.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onContribute={handleContribute}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* Completed goals */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Completed ({completed.length})</Text>
            {completed.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onContribute={handleContribute}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="flag" size={48} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No goals yet</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Tap + to create your first savings goal</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/modals/add-goal')}>
              <Text style={styles.emptyBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 140, gap: Spacing.three },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  addBtn: { backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  summaryCard: {
    flexDirection: 'row', marginHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg, padding: Spacing.three,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryAmt: { fontSize: 15, fontWeight: '700' },
  summaryDivider: { width: 1, marginVertical: 4 },
  section: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  goalCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.three,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    gap: Spacing.two,
  },
  goalCardDone: { opacity: 0.85 },
  completedBadge: { backgroundColor: Colors.success + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.two, paddingVertical: 2, alignSelf: 'flex-start' },
  completedBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  goalInfo: { flex: 1 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.one },
  goalIconWrap: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: 15, fontWeight: '700' },
  goalAmounts: { fontSize: 14 },
  goalTarget: { fontWeight: '400' },
  goalSub: { fontSize: 11, marginTop: 2 },
  goalActions: { gap: Spacing.one, alignItems: 'center' },
  contributeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: BorderRadius.full },
  pctLabel: { fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: Spacing.six, gap: Spacing.two },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2, marginTop: Spacing.two },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
