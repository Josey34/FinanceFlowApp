import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'error' | 'success' | 'info';

interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
}

let _show: ((config: ToastConfig) => void) | null = null;

export function registerToastFn(fn: (config: ToastConfig) => void) {
  _show = fn;
}

export function triggerToast(config: ToastConfig) {
  _show?.(config);
}

const TYPE_STYLES: Record<ToastType, { bg: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  error:   { bg: '#FF4B4B', icon: 'alert-circle',     color: '#fff' },
  success: { bg: '#2DC76D', icon: 'checkmark-circle',  color: '#fff' },
  info:    { bg: Colors.primary, icon: 'information-circle', color: '#fff' },
};

export default function ToastContainer() {
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((cfg: ToastConfig) => {
    if (timer.current) clearTimeout(timer.current);
    setConfig(cfg);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setConfig(null));
    }, cfg.duration ?? 3000);
  }, []);

  registerToastFn(show);

  if (!config) return null;

  const t = TYPE_STYLES[config.type];

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: t.bg, transform: [{ translateY }], opacity }]}
      pointerEvents="none"
    >
      <Ionicons name={t.icon} size={20} color={t.color} />
      <Text style={[styles.text, { color: t.color }]} numberOfLines={2}>
        {config.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 9999,
  },
  text: { flex: 1, fontSize: 14, fontWeight: '600' },
});
