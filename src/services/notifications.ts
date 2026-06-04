import * as Notifications from 'expo-notifications';
import { formatCurrency } from '../utils/formatCurrency';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleBudgetAlert(categoryName: string, pct: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Budget Warning',
      body: `${categoryName} is at ${pct.toFixed(0)}% of its monthly limit`,
    },
    trigger: null,
  });
}

export async function scheduleBillReminder(
  billName: string,
  amount: number,
  daysLeft: number,
  reminderDate: Date,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💳 Bill Due Soon',
      body: `Your ${billName} of ${formatCurrency(amount)} is due in ${daysLeft} days`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
  });
}

export async function scheduleWeeklyDigest(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Weekly Spending Summary',
      body: 'Your weekly financial digest is ready. Tap to view.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 20,
      minute: 0,
    },
  });
}

export async function scheduleMonthlyReport(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📈 Monthly Report Ready',
      body: 'Your spending report for last month is ready. Tap to review.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: 1,
      hour: 9,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
