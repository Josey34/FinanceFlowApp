import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import ThemedScreen from '@/components/ThemedScreen';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { useAccountStore } from '@/store/accountStore';
import { useTransactionStore } from '@/store/transactionStore';
import { todayStr } from '@/utils/formatDate';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { showError, showSuccess } from '@/utils/toast';
import { useSettingsStore } from '@/store/settingsStore';

export default function TransferModal() {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const { currency } = useSettingsStore();
  const currencySymbol = getCurrencySymbol(currency);
  const { accounts, updateAccount } = useAccountStore();
  const { addTransaction } = useTransactionStore();
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '');
  const [toId, setToId] = useState(accounts[1]?.id ?? '');
  const [amount, setAmount] = useState('');

  async function handleTransfer() {
    const parsed = Number.parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) { showError('Enter a valid amount'); return; }
    if (fromId === toId) { showError('Source and destination accounts must be different'); return; }

    const from = accounts.find((a) => a.id === fromId);
    const to = accounts.find((a) => a.id === toId);
    if (!from || !to) return;

    if (from.balance < parsed) {
      showError(`Not enough funds — ${from.name} only has ${format(from.balance)}`);
      return;
    }

    try {
      await updateAccount(fromId, { balance: from.balance - parsed });
      await updateAccount(toId, { balance: to.balance + parsed });

      const today = todayStr();
      await addTransaction({
        merchant: `Transfer to ${to.name}`,
        amount: -parsed, type: 'expense',
        categoryId: 'transfer', category: 'Transfer',
        accountId: fromId, note: `Transfer to ${to.name}`,
        tags: ['transfer'], date: today, icon: '🔄', iconBg: '#7C6FFF', recurring: false,
      });
      await addTransaction({
        merchant: `Transfer from ${from.name}`,
        amount: parsed, type: 'income',
        categoryId: 'transfer', category: 'Transfer',
        accountId: toId, note: `Transfer from ${from.name}`,
        tags: ['transfer'], date: today, icon: '🔄', iconBg: '#2DC76D', recurring: false,
      });

      showSuccess(`Transferred ${format(parsed)} from ${from.name} to ${to.name}`);
      router.back();
    } catch {
      showError('Transfer failed. Check your connection and try again.');
    }
  }

  return (
    <ThemedScreen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Transfer Money</Text>
          <TouchableOpacity onPress={handleTransfer}>
            <Text style={styles.saveBtn}>Transfer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: theme.textSecondary }]}>{currencySymbol}</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* From */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>From Account</Text>
            <View style={styles.accountList}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accountRow, { backgroundColor: theme.card, borderColor: theme.border }, fromId === acc.id && styles.accountRowActive]}
                  onPress={() => setFromId(acc.id)}>
                  <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: theme.text }]}>{acc.name}</Text>
                    <Text style={[styles.accountBalance, { color: theme.textSecondary }]}>{format(acc.balance)}</Text>
                  </View>
                  {fromId === acc.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.arrowRow}>
            <Ionicons name="arrow-down" size={24} color={Colors.primary} />
          </View>

          {/* To */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>To Account</Text>
            <View style={styles.accountList}>
              {accounts.filter((a) => a.id !== fromId).map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accountRow, { backgroundColor: theme.card, borderColor: theme.border }, toId === acc.id && styles.accountRowActive]}
                  onPress={() => setToId(acc.id)}>
                  <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: theme.text }]}>{acc.name}</Text>
                    <Text style={[styles.accountBalance, { color: theme.textSecondary }]}>{format(acc.balance)}</Text>
                  </View>
                  {toId === acc.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  content: { padding: Spacing.three, gap: Spacing.three },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.four },
  currency: { fontSize: 32, fontWeight: '300', color: Colors.textSecondary, marginRight: Spacing.one },
  amountInput: { fontSize: 48, fontWeight: '700', color: Colors.textPrimary, minWidth: 100, textAlign: 'center' },
  field: { gap: Spacing.two },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  accountList: { gap: Spacing.two },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.two + 2, borderWidth: 1, borderColor: Colors.border },
  accountRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  accountDot: { width: 12, height: 12, borderRadius: 6 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  accountBalance: { fontSize: 12, color: Colors.textSecondary },
  arrowRow: { alignItems: 'center' },
});
