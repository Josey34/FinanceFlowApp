import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  children: React.ReactNode;
}

export default function ThemedScreen({ children }: Readonly<Props>) {
  const { background } = useThemeColors();
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: background }]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
