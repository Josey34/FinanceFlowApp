import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useCategoryStore } from "@/store/categoryStore";
import { Transaction } from "@/types";
import { getSafeIoniconName } from "@/utils/icon";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionItem({
  transaction,
  onPress,
}: Readonly<Props>) {
  const { format } = useCurrency();
  const theme = useThemeColors();
  const { categories } = useCategoryStore();
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? Colors.success : theme.text;
  const amountPrefix = isIncome ? "+" : "-";
  const absAmount = format(Math.abs(transaction.amount));
  const cat = categories.find((c) => c.id === transaction.categoryId);
  const iconName = getSafeIoniconName(
    cat?.icon ?? (isIncome ? "cash" : "card"),
    isIncome ? "cash" : "card",
  ) as IoniconsName;
  const iconColor = cat?.color ?? (isIncome ? Colors.success : Colors.primary);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrapper, { backgroundColor: iconColor + "20" }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.merchant, { color: theme.text }]}>
          {transaction.merchant}
        </Text>
        <Text style={[styles.category, { color: theme.textSecondary }]}>
          {transaction.category}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}
        {absAmount}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two + 2,
    gap: Spacing.three,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  merchant: {
    fontSize: 14,
    fontWeight: "600",
  },
  category: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
});
