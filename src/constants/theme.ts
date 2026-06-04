import { Platform } from 'react-native';
import type { ThemeMode } from '../types';

export const APP_THEMES: Record<ThemeMode, {
  label: string;
  isDark: boolean;
  primary: string;
  secondary: string;
  bg: string;
  card: string;
  text: string;
  textSec: string;
  border: string;
  input: string;
}> = {
  light:    { label: 'Light',    isDark: false, primary: '#7C6FFF', secondary: '#FF7B54', bg: '#F5F5FA', card: '#FFFFFF', text: '#1A1A2E', textSec: '#9B9BB4', border: '#E8E8F0', input: '#EEEEF8' },
  dark:     { label: 'Dark',     isDark: true,  primary: '#7C6FFF', secondary: '#FF7B54', bg: '#0D0D1A', card: '#1A1A2E', text: '#FFFFFF',  textSec: '#6B6B8A', border: '#2A2B4A', input: '#2A2B4A' },
  system:   { label: 'System',   isDark: false, primary: '#7C6FFF', secondary: '#FF7B54', bg: '#F5F5FA', card: '#FFFFFF', text: '#1A1A2E', textSec: '#9B9BB4', border: '#E8E8F0', input: '#EEEEF8' },
  ocean:    { label: 'Ocean',    isDark: true,  primary: '#0EA5E9', secondary: '#F59E0B', bg: '#040D21', card: '#0A1929', text: '#E0F2FE',  textSec: '#7DD3FC', border: '#1E3A5F', input: '#162B45' },
  forest:   { label: 'Forest',   isDark: false, primary: '#10B981', secondary: '#F59E0B', bg: '#F0FDF4', card: '#FFFFFF', text: '#064E3B',  textSec: '#059669', border: '#D1FAE5', input: '#ECFDF5' },
  sunset:   { label: 'Sunset',   isDark: true,  primary: '#F97316', secondary: '#EF4444', bg: '#1A0A00', card: '#2D1500', text: '#FED7AA',  textSec: '#FB923C', border: '#7C2D12', input: '#431407' },
  rose:     { label: 'Rose',     isDark: false, primary: '#EC4899', secondary: '#8B5CF6', bg: '#FFF1F2', card: '#FFFFFF', text: '#881337',  textSec: '#BE185D', border: '#FCE7F3', input: '#FDF2F8' },
  midnight: { label: 'Midnight', isDark: true,  primary: '#8B5CF6', secondary: '#EC4899', bg: '#030010', card: '#0E0028', text: '#EDE9FE',  textSec: '#A78BFA', border: '#2E1065', input: '#1A0040' },
};

export const Colors = {
  primary: '#7C6FFF',
  primaryLight: '#B4ADFF',
  secondary: '#FF7B54',
  cardDark: '#1A1A2E',
  cardDarkAlt: '#2A2B4A',
  background: '#F5F5FA',
  white: '#FFFFFF',
  success: '#2DC76D',
  danger: '#FF4B4B',
  textPrimary: '#1A1A2E',
  textSecondary: '#9B9BB4',
  border: '#E8E8F0',

  light: {
    text: '#1A1A2E',
    background: '#F5F5FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEEEF8',
    textSecondary: '#9B9BB4',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D0D1A',
    backgroundElement: '#1A1A2E',
    backgroundSelected: '#2A2B4A',
    textSecondary: '#6B6B8A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
