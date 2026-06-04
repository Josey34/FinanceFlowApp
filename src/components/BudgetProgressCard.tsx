import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Category } from "@/types";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Props {
  category: Category;
  rolloverAmount?: number;
  onEdit?: () => void;
}

export default function BudgetProgressCard({
  category,
  rolloverAmount = 0,
  onEdit,
}: Readonly<Props>) {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const limit = (category.monthlyLimit ?? 0) + rolloverAmount;
  const iconName = getSafeIoniconName(category.icon, "card");
  const pct = limit > 0 ? Math.min((category.spent / limit) * 100, 100) : 0;
  let barColor: string = Colors.primary;
  if (pct >= 100) barColor = Colors.danger;
  else if (pct >= 80) barColor = Colors.secondary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: category.color + "20" },
            ]}
          >
            <Ionicons
              name={iconName as IoniconsName}
              size={20}
              color={category.color}
            />
          </View>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>
              {category.name}
            </Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>
              {format(category.spent)} / {format(limit)} budget
              {rolloverAmount > 0
                ? ` (+${format(rolloverAmount)} rollover)`
                : ""}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.pct, { color: barColor }]}>
            {pct.toFixed(0)}%
          </Text>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="pencil-outline"
                size={15}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  left: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 14, fontWeight: "600" },
  sub: { fontSize: 11, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  pct: { fontSize: 14, fontWeight: "700" },
  track: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: BorderRadius.full },
});
