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
import { useGoalStore } from '@/store/goalStore';
import { showError } from '@/utils/toast';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: IoniconsName[] = [
  'flag', 'home', 'airplane', 'laptop', 'car',
  'book', 'diamond', 'shield', 'school', 'barbell',
];
const COLORS = [Colors.primary, Colors.secondary, Colors.success, '#FFD93D', '#B4ADFF', '#FF4B4B'];

export default function AddGoalModal() {
  const theme = useThemeColors();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState<IoniconsName>('flag');
  const [color, setColor] = useState<string>(Colors.primary);
  const { addGoal } = useGoalStore();

  async function handleSave() {
    const parsed = Number.parseFloat(target.replaceAll(',', ''));
    if (!name.trim()) { showError('Enter a goal name'); return; }
    if (Number.isNaN(parsed) || parsed <= 0) { showError('Enter a valid target amount'); return; }
    try {
      await addGoal({ name: name.trim(), targetAmount: parsed, savedAmount: 0, currency: 'USD', deadline: null, icon, color, completed: false });
      router.back();
    } catch {
      showError('Failed to save. Check your connection and try again.');
    }
  }

  return (
    <ThemedScreen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>New Savings Goal</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.preview, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={36} color={color} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Goal Name</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} value={name} onChangeText={setName} placeholder="e.g. Emergency Fund" placeholderTextColor={theme.textSecondary} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Target Amount ($)</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]} value={target} onChangeText={setTarget} placeholder="0.00" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
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
  colorRow: { flexDirection: 'row', gap: Spacing.two },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
});
