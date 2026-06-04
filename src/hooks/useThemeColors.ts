import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { APP_THEMES } from '../constants/theme';

export interface ThemeColors {
  background: string;
  card: string;
  input: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  isDark: boolean;
}

export function useThemeColors(): ThemeColors {
  const { theme } = useSettingsStore();
  const system = useColorScheme();

  if (theme === 'system') {
    const base = system === 'dark' ? APP_THEMES.dark : APP_THEMES.light;
    return {
      background:    base.bg,
      card:          base.card,
      input:         base.input,
      text:          base.text,
      textSecondary: base.textSec,
      border:        base.border,
      primary:       base.primary,
      secondary:     base.secondary,
      isDark:        base.isDark,
    };
  }

  const t = APP_THEMES[theme] ?? APP_THEMES.light;
  return {
    background:    t.bg,
    card:          t.card,
    input:         t.input,
    text:          t.text,
    textSecondary: t.textSec,
    border:        t.border,
    primary:       t.primary,
    isDark:        t.isDark,
  };
}
