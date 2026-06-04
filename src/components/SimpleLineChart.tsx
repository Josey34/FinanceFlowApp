import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Colors, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface DataPoint {
  day: number;
  amount: number;
}

interface Props {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export default function SimpleLineChart({ data, width = 300, height = 100 }: Readonly<Props>) {
  const theme = useThemeColors();
  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No spending data</Text>
      </View>
    );
  }

  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 20;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const maxDay = Math.max(...data.map((d) => d.day));

  const toX = (day: number) => padL + (day / maxDay) * chartW;
  const toY = (amount: number) => padT + chartH - (amount / maxAmount) * chartH;

  const sorted = [...data].sort((a, b) => a.day - b.day);

  const pathD = sorted
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.day)} ${toY(d.amount)}`)
    .join(' ');

  // Fill area under line
  const firstX = toX(sorted[0].day);
  const lastX = toX(sorted[sorted.length - 1].day);
  const bottom = padT + chartH;
  const fillD = `${pathD} L ${lastX} ${bottom} L ${firstX} ${bottom} Z`;

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Fill */}
        <Path d={fillD} fill={Colors.primary + '18'} />
        {/* Line */}
        <Path d={pathD} stroke={Colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots for each point */}
        {sorted.map((d) => (
          <Circle key={d.day} cx={toX(d.day)} cy={toY(d.amount)} r={3} fill={Colors.primary} />
        ))}
        {/* Baseline */}
        <Line x1={padL} y1={bottom} x2={width - padR} y2={bottom} stroke={theme.border} strokeWidth={1} />
      </Svg>
      <View style={styles.xLabels}>
        <Text style={[styles.xLabel, { color: theme.textSecondary }]}>1</Text>
        <Text style={[styles.xLabel, { color: theme.textSecondary }]}>{Math.round(maxDay / 2)}</Text>
        <Text style={[styles.xLabel, { color: theme.textSecondary }]}>{maxDay}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13 },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  xLabel: { fontSize: 10 },
});
