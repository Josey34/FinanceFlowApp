import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  FlatList, TextInput, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$'    },
  { code: 'IDR', name: 'Indonesian Rupiah',  symbol: 'Rp'   },
  { code: 'EUR', name: 'Euro',               symbol: '€'    },
  { code: 'GBP', name: 'British Pound',      symbol: '£'    },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥'    },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'CA$'  },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$'   },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr'   },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥'    },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹'    },
  { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$'   },
  { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$'  },
  { code: 'KRW', name: 'Korean Won',         symbol: '₩'    },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$'   },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ'  },
  { code: 'NGN', name: 'Nigerian Naira',     symbol: '₦'    },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R'    },
  { code: 'GHS', name: 'Ghanaian Cedi',      symbol: '₵'    },
];

function Separator() {
  return <View style={styles.separator} />;
}

export default function CurrencySelector() {
  const { currency, setCurrency } = useSettingsStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerSymbol, { color: Colors.primary }]}>{current.symbol}</Text>
        <Text style={[styles.triggerCode, { color: theme.textSecondary }]}>{current.code}</Text>
        <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}>
        {/* Dim backdrop */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + Spacing.three }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[styles.searchRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Ionicons name="search" size={16} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              value={search}
              onChangeText={setSearch}
              placeholder="Search currencies..."
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={Separator}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.row,
                  { backgroundColor: theme.card },
                  item.code === currency && { backgroundColor: Colors.primary + '12' },
                ]}
                onPress={() => { setCurrency(item.code); setSearch(''); setOpen(false); }}>
                <View style={[styles.symbolBadge, { backgroundColor: Colors.primary + '18' }]}>
                  <Text style={[styles.symbol, { color: Colors.primary }]}>{item.symbol}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.code, { color: theme.text }]}>{item.code}</Text>
                  <Text style={[styles.name, { color: theme.textSecondary }]}>{item.name}</Text>
                </View>
                {item.code === currency && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  triggerSymbol: { fontSize: 15, fontWeight: '700' },
  triggerCode: { fontSize: 13, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '72%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: Spacing.two,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.two,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    margin: Spacing.three, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two + 2, height: 42,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingHorizontal: Spacing.three },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    paddingVertical: Spacing.two + 2, borderRadius: BorderRadius.md,
  },
  symbolBadge: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  symbol: { fontSize: 15, fontWeight: '700' },
  info: { flex: 1 },
  code: { fontSize: 14, fontWeight: '700' },
  name: { fontSize: 12, marginTop: 1 },
  separator: { height: 4 },
});
