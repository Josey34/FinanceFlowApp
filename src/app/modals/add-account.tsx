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
import { useAccountStore } from '@/store/accountStore';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCurrency } from '@/hooks/useCurrency';
import { AccountType } from '@/types';
import { showError } from '@/utils/toast';
import { showConfirm } from '@/components/AppDialog';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ACCOUNT_TYPES: { id: AccountType; label: string; icon: IoniconsName }[] = [
  { id: 'bank', label: 'Bank Account', icon: 'business' },
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'credit', label: 'Credit Card', icon: 'card' },
  { id: 'savings', label: 'Savings', icon: 'wallet' },
];
const COLORS = [Colors.primary, Colors.secondary, Colors.success, '#FFD93D', '#B4ADFF', '#FF4B4B'];

export default function AddAccountModal() {
  const theme = useThemeColors();
  const { format } = useCurrency();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState<string>(Colors.primary);
  const { accounts, addAccount, deleteAccount } = useAccountStore();
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();

  async function handleSave() {
    if (!name.trim()) { showError('Enter an account name'); return; }
    try {
      await addAccount({ name: name.trim(), type, balance: Number.parseFloat(balance) || 0, currency, color });
      setName(''); setBalance(''); setType('bank'); setColor(Colors.primary);
    } catch {
      showError('Failed to save. Check your connection and try again.');
    }
  }

  function handleDelete(id: string, accName: string) {
    showConfirm({
      title: 'Delete Account',
      message: `Remove "${accName}"?`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteAccount(id);
        } catch {
          showError('Failed to delete. Check your connection and try again.');
        }
      },
    });
  }

  return (
    <ThemedScreen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Manage Accounts</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Existing accounts */}
          {accounts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Your Accounts</Text>
              <View style={[styles.accountList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {accounts.map((acc, i) => (
                  <View key={acc.id}>
                    {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                    <View style={styles.accountRow}>
                      <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
                      <View style={styles.accountInfo}>
                        <Text style={[styles.accountName, { color: theme.text }]}>{acc.name}</Text>
                        <Text style={[styles.accountBalance, { color: theme.textSecondary }]}>
                          {acc.type} · {format(acc.balance)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(acc.id, acc.name)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add new account */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Add Account</Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Account Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
                value={name} onChangeText={setName}
                placeholder="e.g. Chase Checking"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Account Type</Text>
              <View style={styles.typeGrid}>
                {ACCOUNT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeBtn, { backgroundColor: theme.card, borderColor: theme.border }, type === t.id && styles.typeBtnActive]}
                    onPress={() => setType(t.id)}>
                    <Ionicons name={t.icon} size={20} color={type === t.id ? Colors.primary : theme.textSecondary} />
                    <Text style={[styles.typeLabel, { color: theme.text }, type === t.id && styles.typeLabelActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Current Balance</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
                value={balance} onChangeText={setBalance}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
              <View style={styles.colorRow}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorBtn, { backgroundColor: c }, color === c && { borderWidth: 3, borderColor: theme.text }]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Add Account</Text>
            </TouchableOpacity>
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
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  accountList: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  accountRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, gap: Spacing.two },
  accountDot: { width: 12, height: 12, borderRadius: 6 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  accountBalance: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border },
  field: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  input: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 4, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  typeBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.two + 2, borderWidth: 1, borderColor: Colors.border },
  typeBtnActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  typeLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  typeLabelActive: { color: Colors.primary, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: Spacing.two },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.three },
  addBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
