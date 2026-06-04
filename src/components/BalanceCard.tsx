import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/useCurrency';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  balance: number;
  holderName?: string;
  accountCount?: number;
}

export default function BalanceCard({ balance, holderName = 'User', accountCount = 0 }: Readonly<Props>) {
  const { format } = useCurrency();
  const theme = useThemeColors();
  const formatted = format(balance);
  const cardBg = theme.isDark ? theme.card : theme.primary;
  const cardAlt = theme.isDark ? theme.border : theme.secondary;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={[styles.circleTopRight, { backgroundColor: cardAlt }]} />
      <View style={[styles.circleBottomLeft, { backgroundColor: cardAlt }]} />

      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.amount}>{formatted}</Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Account Holder</Text>
          <Text style={styles.cardNumber}>{holderName}</Text>
        </View>
        <View style={styles.mastercardWrapper}>
          <View style={[styles.mastercardCircle, { backgroundColor: '#EB001B', opacity: 0.9 }]} />
          <View style={[styles.mastercardCircle, { backgroundColor: '#FF5F00', marginLeft: -14 }]} />
        </View>
      </View>

      <View style={styles.holderRow}>
        <Text style={styles.holderName}>
          {accountCount > 0 ? `${accountCount} account${accountCount > 1 ? 's' : ''}` : 'No accounts'}
        </Text>
        <Text style={styles.expiry}>FinanceFlow</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginHorizontal: Spacing.three,
    overflow: 'hidden',
    minHeight: 180,
  },
  circleTopRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -40,
    right: -30,
    opacity: 0.6,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -30,
    left: -20,
    opacity: 0.4,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: Spacing.one,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.four,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 2,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  mastercardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mastercardCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  holderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holderName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  expiry: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
});
