import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Spacing } from '@/constants/theme';
import { PieSegment } from '@/types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  segments: PieSegment[];
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

export default function SimplePieChart({ segments, size = 160 }: Readonly<Props>) {
  const theme = useThemeColors();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let currentAngle = 0;
  const arcs = segments.map((seg) => {
    const sweep = (seg.percentage / 100) * 360;
    const path = buildArc(cx, cy, r, currentAngle, currentAngle + sweep);
    currentAngle += sweep;
    return { ...seg, path };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {arcs.map((arc) => (
            <Path key={arc.name} d={arc.path} fill={arc.color} />
          ))}
        </G>
      </Svg>

      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.name} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={[styles.name, { color: theme.text }]}>{seg.name}</Text>
            <Text style={[styles.pct, { color: theme.text }]}>{seg.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  legend: {
    flex: 1,
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  pct: {
    fontSize: 12,
    fontWeight: '700',
  },
});
