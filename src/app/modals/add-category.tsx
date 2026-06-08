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
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';
import { showError } from '@/utils/toast';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: IoniconsName[] = [
  'restaurant', 'bag-handle', 'medkit', 'car', 'film',
  'home', 'wallet', 'airplane', 'laptop', 'musical-notes',
  'barbell', 'book', 'fast-food', 'cafe', 'game-controller',
];
const COLORS = [Colors.primary, Colors.secondary, Colors.success, '#FFD93D', '#B4ADFF', '#FF4B4B', '#00B894', '#1DB954', '#FF9900', '#0984e3'];

export default function AddCategoryModal() {
  const theme = useThemeColors();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IoniconsName>('restaurant');
  const [color, setColor] = useState<string>(Colors.primary);
  const [limit, setLimit] = useState('');
  const { addCategory } = useCategoryStore();

  async function handleSave() {
    if (!name.trim()) { showError('Enter a category name'); return; }
    try {
      await addCategory({
        name: name.trim(),
        icon,
        color,
        monthlyLimit: limit ? Number.parseFloat(limit) : null,
        isDefault: false,
        archived: false,
        spent: 0,
      } as Category);
      router.back();
    } catch {
      showError('Failed to save. Check your connection and try again.');
    }
  }

  return (
    <ThemedScreen modal>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>New Category</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.preview, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={36} color={color} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Category Name</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} value={name} onChangeText={setName} placeholder="e.g. Gym" placeholderTextColor={theme.textSecondary} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Monthly Limit (optional)</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} value={limit} onChangeText={setLimit} placeholder="Leave blank for no limit" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }, icon === ic && styles.iconBtnActive]} onPress={() => setIcon(ic)}>
                  <Ionicons name={ic} size={22} color={icon === ic ? Colors.primary : theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && { borderWidth: 3, borderColor: theme.text }]} onPress={() => setColor(c)} />
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
  preview: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  field: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  input: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 4, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  iconBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  iconBtnActive: { borderColor: Colors.primary, borderWidth: 2 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
});
