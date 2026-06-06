import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  children: React.ReactNode;
  modal?: boolean;
}

export default function ThemedScreen({ children, modal }: Readonly<Props>) {
  const { background } = useThemeColors();
  return (
    <SafeAreaView
      edges={modal ? ['top', 'bottom'] : ['top']}
      style={[styles.safe, { backgroundColor: background }]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
