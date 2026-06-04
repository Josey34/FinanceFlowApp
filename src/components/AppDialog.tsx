import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCallback, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Modal, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

export type DialogButton = {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  primary?: boolean;
};

export type DialogConfig = {
  title: string;
  message?: string;
  buttons?: DialogButton[];
  input?: {
    placeholder?: string;
    defaultValue?: string;
    keyboardType?: 'default' | 'decimal-pad' | 'email-address';
    onConfirm: (value: string) => void;
  };
};

let _show: ((config: DialogConfig) => void) | null = null;

export function showConfirm(params: {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  _show?.({
    title: params.title,
    message: params.message,
    buttons: [
      { label: 'Cancel', onPress: params.onCancel },
      { label: params.confirmLabel ?? 'Confirm', onPress: params.onConfirm, destructive: params.destructive, primary: true },
    ],
  });
}

export function showAlert(title: string, message?: string) {
  _show?.({ title, message, buttons: [{ label: 'OK', primary: true }] });
}

export function showChoice(title: string, message: string | undefined, options: { label: string; onPress: () => void }[]) {
  _show?.({
    title,
    message,
    buttons: [
      ...options.map((o) => ({ label: o.label, onPress: o.onPress })),
      { label: 'Cancel' },
    ],
  });
}

export function showInput(params: {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'email-address';
  onConfirm: (value: string) => void;
}) {
  _show?.({
    title: params.title,
    message: params.message,
    input: {
      placeholder: params.placeholder,
      defaultValue: params.defaultValue,
      keyboardType: params.keyboardType,
      onConfirm: params.onConfirm,
    },
    buttons: [
      { label: 'Cancel' },
      { label: 'Confirm', primary: true },
    ],
  });
}

export default function AppDialog() {
  const theme = useThemeColors();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const [inputValue, setInputValue] = useState('');
  const scale   = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((cfg: DialogConfig) => {
    setConfig(cfg);
    setInputValue(cfg.input?.defaultValue ?? '');
    setVisible(true);
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  _show = show;

  function dismiss() {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 0.9, useNativeDriver: true, tension: 140, friction: 9 }),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => { setVisible(false); setConfig(null); });
  }

  function handleButton(btn: DialogButton) {
    if (config?.input && btn.primary) {
      config.input.onConfirm(inputValue);
    }
    btn.onPress?.();
    dismiss();
  }

  if (!config) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.wrapper, { opacity }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={dismiss} />
          <Animated.View style={[styles.card, { backgroundColor: theme.card, transform: [{ scale }] }]}>
            <Text style={[styles.title, { color: theme.text }]}>{config.title}</Text>
            {config.message ? (
              <Text style={[styles.message, { color: theme.textSecondary }]}>{config.message}</Text>
            ) : null}
            {config.input ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={config.input.placeholder}
                placeholderTextColor={theme.textSecondary}
                keyboardType={config.input.keyboardType ?? 'default'}
                autoFocus
              />
            ) : null}
            <View style={[styles.buttons, config.buttons && config.buttons.length > 2 && styles.buttonsColumn]}>
              {config.buttons?.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    btn.primary && !btn.destructive && { backgroundColor: Colors.primary },
                    btn.destructive                  && { backgroundColor: Colors.danger },
                    !btn.primary && !btn.destructive && { borderWidth: 1, borderColor: theme.border },
                    config.buttons && config.buttons.length > 2 && styles.btnFull,
                  ]}
                  onPress={() => handleButton(btn)}
                >
                  <Text style={[
                    styles.btnText,
                    (btn.primary || btn.destructive) ? { color: Colors.white } : { color: theme.textSecondary },
                  ]}>
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  card: {
    width: '84%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    gap: Spacing.two + 2,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title:   { fontSize: 17, fontWeight: '700' },
  message: { fontSize: 14, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
    marginTop: Spacing.one,
  },
  buttons:       { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  buttonsColumn: { flexDirection: 'column' },
  btn:     { flex: 1, paddingVertical: Spacing.two + 2, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnFull: { flex: 0 },
  btnText: { fontSize: 15, fontWeight: '600' },
});
