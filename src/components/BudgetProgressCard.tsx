import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Category } from "@/types";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Props {
  category: Category;
  rolloverAmount?: number;
}

export default function BudgetProgressCard({
  category,
  rolloverAmount = 0,
}: Readonly<Props>) {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const limit = (category.monthlyLimit ?? 0) + rolloverAmount;
  const iconName = getSafeIoniconName(category.icon, "card");
  const pct = limit > 0 ? Math.min((category.spent / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - category.spent, 0);

  let barColor: string = Colors.primary;
  if (pct >= 100) barColor = Colors.danger;
  else if (pct >= 80) barColor = Colors.secondary;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Top row: icon + name + pct badge */}
      <View style={styles.top}>
        <View style={[styles.iconWrapper, { backgroundColor: category.color + "22" }]}>
          <Ionicons name={iconName as IoniconsName} size={20} color={category.color} />
        </View>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {category.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: barColor + "20" }]}>
          <Text style={[styles.badgeText, { color: barColor }]}>{pct.toFixed(0)}%</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>

      {/* Bottom row: spent vs remaining */}
      <View style={styles.bottom}>
        <Text style={[styles.spent, { color: barColor }]}>
          {format(category.spent)} spent
        </Text>
        <Text style={[styles.remaining, { color: theme.textSecondary }]}>
          {format(remaining)} left
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: Spacing.two,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontSize: 14, fontWeight: "600" },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: BorderRadius.full },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spent: { fontSize: 12, fontWeight: "600" },
  remaining: { fontSize: 12 },
});
