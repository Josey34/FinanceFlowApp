import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconsName; iconActive: IoniconsName; label: string }[] = [
  { name: 'index',        icon: 'home-outline',       iconActive: 'home',         label: 'Home' },
  { name: 'transactions', icon: 'receipt-outline',    iconActive: 'receipt',      label: 'Spend' },
  { name: 'budgets',      icon: 'wallet-outline',     iconActive: 'wallet',       label: 'Budget' },
  { name: 'goals',        icon: 'flag-outline',       iconActive: 'flag',         label: 'Goals' },
  { name: 'reports',      icon: 'bar-chart-outline',  iconActive: 'bar-chart',    label: 'Reports' },
  { name: 'settings',     icon: 'settings-outline',   iconActive: 'settings',     label: 'Settings' },
];

const LEFT = TABS.slice(0, 3);
const RIGHT = TABS.slice(3, 6);

interface TabItemProps {
  tab: typeof TABS[0];
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ tab, isFocused, onPress }: Readonly<TabItemProps>) {
  const theme = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.12 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.55,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <Animated.View style={[styles.tabIconWrap, { transform: [{ scale }], opacity }]}>
        <Ionicons
          name={isFocused ? tab.iconActive : tab.icon}
          size={22}
          color={isFocused ? theme.primary : theme.textSecondary}
        />
        <Text style={[styles.tabLabel, { color: isFocused ? theme.primary : theme.textSecondary }]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const fabScale = useRef(new Animated.Value(1)).current;

  function getRouteIndex(tabName: string) {
    return state.routes.findIndex((r) => r.name === tabName);
  }

  function handleTabPress(tabName: string) {
    const index = getRouteIndex(tabName);
    if (index === -1) return;
    const route = state.routes[index];
    const isFocused = state.index === index;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }

  function handleFABPress() {
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 30 }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    router.push('/modals/add-transaction');
  }

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={[styles.bar, { backgroundColor: theme.card }]}>
        {/* Left 3 tabs */}
        {LEFT.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            isFocused={state.index === getRouteIndex(tab.name)}
            onPress={() => handleTabPress(tab.name)}
          />
        ))}

        {/* FAB */}
        <View style={styles.fabSlot}>
          <Animated.View style={[styles.fabShadow, { transform: [{ scale: fabScale }], shadowColor: theme.primary }]}>
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={handleFABPress} activeOpacity={0.85}>
              <Ionicons name="add" size={30} color={Colors.white} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Right 3 tabs */}
        {RIGHT.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            isFocused={state.index === getRouteIndex(tab.name)}
            onPress={() => handleTabPress(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

function renderTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="expenses" options={{ href: null }} />
    </Tabs>
  );
}

const BAR_HEIGHT = 64;
const FAB_SIZE = 58;

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    pointerEvents: 'box-none',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 40,
    height: BAR_HEIGHT,
    width: '100%',
    paddingHorizontal: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fabSlot: {
    width: FAB_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(FAB_SIZE / 2 + 4),
  },
  fabShadow: {
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: FAB_SIZE / 2,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
});
