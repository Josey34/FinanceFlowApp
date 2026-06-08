import { vi } from "vitest";

vi.mock("@expo/vector-icons", () => {
  const Icon = "Icon";
  return { Ionicons: Icon, FontAwesome: Icon, MaterialIcons: Icon };
});

vi.mock("expo-router", () => ({
  router: { back: vi.fn(), push: vi.fn(), replace: vi.fn() },
  Link: "Link",
  useLocalSearchParams: () => ({}),
}));

vi.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock("@/hooks/useCurrency", () => ({
  useCurrency: () => ({
    format: (n: number) => `$${n.toFixed(2)}`,
    convert: (n: number) => n,
    rates: {},
    loading: false,
  }),
}));

vi.mock("@/hooks/useThemeColors", () => ({
  useThemeColors: () => ({
    background: "#F5F5FA",
    card: "#FFFFFF",
    input: "#EEEEF8",
    text: "#1A1A2E",
    textSecondary: "#9B9BB4",
    border: "#E8E8F0",
    primary: "#7C6FFF",
    secondary: "#FF7B54",
    isDark: false,
  }),
}));

vi.mock("@/store/categoryStore", () => ({
  useCategoryStore: Object.assign(
    (selector?: (state: any) => any) => {
      const state = {
        categories: [
          {
            id: "food",
            name: "Food",
            icon: "restaurant",
            color: "#7C6FFF",
            monthlyLimit: 500,
            isDefault: true,
            archived: false,
            spent: 200,
          },
          {
            id: "transport",
            name: "Transport",
            icon: "car",
            color: "#FFD93D",
            monthlyLimit: 300,
            isDefault: true,
            archived: false,
            spent: 50,
          },
        ],
      };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ categories: [] }) },
  ),
}));

vi.mock("@/store/settingsStore", () => ({
  useSettingsStore: Object.assign(
    (selector?: (state: any) => any) => {
      const state = { currency: "USD" };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ currency: "USD" }) },
  ),
}));

vi.mock("@/store/accountStore", () => ({
  useAccountStore: Object.assign(() => ({ accounts: [] }), {
    getState: () => ({ accounts: [] }),
  }),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: Object.assign(() => ({ user: null }), {
    getState: () => ({ user: null }),
  }),
}));

vi.mock("@/store/transactionStore", () => ({
  useTransactionStore: Object.assign(() => ({ transactions: [] }), {
    getState: () => ({ transactions: [] }),
  }),
}));

vi.mock("react-native-svg", () => {
  const Svg = "Svg";
  return {
    default: Svg,
    Svg,
    Circle: "Circle",
    Line: "Line",
    Rect: "Rect",
    Path: "Path",
    G: "G",
    Text: "Text",
    Defs: "Defs",
    LinearGradient: "LinearGradient",
    Stop: "Stop",
  };
});
