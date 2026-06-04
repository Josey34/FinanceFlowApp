import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { BarDataPoint } from '@/types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  data: BarDataPoint[];
  maxHeight?: number;
}

export default function SimpleBarChart({ data, maxHeight = 80 }: Readonly<Props>) {
  const theme = useThemeColors();
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]));

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
          <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Expenses</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {data.map((item) => {
          const incomeHeight = (item.income / maxValue) * maxHeight;
          const expenseHeight = (item.expense / maxValue) * maxHeight;
          return (
            <View key={item.month} style={styles.group}>
              <View style={[styles.barContainer, { height: maxHeight }]}>
                <View
                  style={[
                    styles.bar,
                    { height: incomeHeight, backgroundColor: Colors.primary },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: expenseHeight, backgroundColor: Colors.secondary },
                  ]}
                />
              </View>
              <Text style={[styles.monthLabel, { color: theme.textSecondary }]}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  group: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    justifyContent: 'center',
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  monthLabel: {
    fontSize: 10,
    marginTop: Spacing.one,
  },
});
