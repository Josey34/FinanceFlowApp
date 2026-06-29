# 💰 FinanceFlow — Personal Finance Manager

> A full-featured React Native mobile app for tracking expenses, managing budgets, visualizing spending reports, and reaching savings goals — powered by Firebase.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Database Schema](#database-schema)
- [App Screens](#app-screens)
- [API & Services](#api--services)
- [State Management](#state-management)
- [Push Notifications](#push-notifications)
- [Exporting Data](#exporting-data)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**FinanceFlow** is a cross-platform iOS & Android personal finance app built with React Native and Expo. It helps you:

- Track every income and expense across custom categories
- Set monthly budgets and get alerted before you overspend
- View beautiful monthly reports with charts and trends
- Build savings goals and track your progress
- Get reminders for recurring bills and payments
- Export your financial data at any time

All your data is securely stored in Firebase Firestore with real-time sync, so it works across devices and even offline.

---

## Features

### 💳 Transactions

- Add income and expense transactions
- Assign categories with custom icons and colors
- Add notes and tags to each transaction
- Mark transactions as recurring (daily / weekly / monthly / yearly)
- Edit or delete any transaction
- Search and filter by date, category, amount, or keyword

### 📂 Categories

- Default categories: Food, Rent, Transport, Health, Entertainment, Shopping, Savings, Other
- Create fully custom categories with icon and color
- Set monthly spending limits per category
- Archive unused categories

### 📊 Budget Management

- Set a total monthly budget
- Per-category budget limits with visual progress bars
- Color-coded status: green (safe) → yellow (warning at 80%) → red (over budget)
- Budget rollover option (carry unspent amounts to next month)

### 📈 Monthly Reports

- Pie chart: breakdown of spending by category
- Bar chart: month-over-month spending comparison
- Line chart: daily spending trend within a month
- Income vs. expense summary cards
- Swipe left/right to navigate between months
- Year-at-a-glance overview

### 🎯 Savings Goals

- Create named goals with a target amount and deadline
- Allocate money toward a goal manually or automatically
- Progress rings with estimated completion dates
- Celebrate with animation when a goal is reached

### 🔔 Notifications & Reminders

- Bill due date reminders (customizable lead time)
- Budget overspend alerts (push notifications)
- Weekly spending summary digest
- Monthly report ready notification

### 🏦 Multi-Account Support

- Track across Cash, Bank Account, Credit Card, Savings Account
- Per-account balance tracking
- Transfer money between accounts

### 📤 Data Export

- Export transactions as CSV
- Monthly PDF statement
- Full data backup as JSON

### 🌙 UI & UX

- Dark and Light mode
- Multi-currency support with live conversion
- Biometric lock (Face ID / Fingerprint)
- Offline-first — works without internet, syncs when back online

---

## Tech Stack

| Layer         | Technology                      | Purpose                         |
| ------------- | ------------------------------- | ------------------------------- |
| Framework     | React Native + Expo SDK 51      | Cross-platform iOS & Android    |
| Language      | TypeScript                      | Type safety throughout          |
| Navigation    | React Navigation v6             | Stack, Tab, Modal navigation    |
| Database      | Firebase Firestore              | Real-time NoSQL cloud database  |
| Auth          | Firebase Authentication         | Email, Google, Apple Sign-In    |
| State         | Zustand                         | Lightweight global state        |
| Charts        | react-native-gifted-charts      | Bar, Line, Pie charts           |
| Notifications | Expo Notifications              | Push + local notifications      |
| Storage       | AsyncStorage                    | Offline cache                   |
| UI Components | React Native Paper              | Material Design components      |
| Icons         | @expo/vector-icons              | Icon library                    |
| Currency      | exchangerate-api.com            | Live exchange rates (free tier) |
| Export        | expo-file-system + expo-sharing | CSV/PDF export                  |

---

## Project Structure

```
finance-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator
│   │   ├── dashboard.tsx         # Home overview screen
│   │   ├── transactions.tsx      # All transactions list
│   │   ├── budgets.tsx           # Category budget overview
│   │   ├── reports.tsx           # Monthly charts & reports
│   │   └── settings.tsx          # App settings
│   ├── modals/
│   │   ├── add-transaction.tsx   # Add/edit transaction modal
│   │   ├── add-category.tsx      # Create/edit category modal
│   │   ├── add-goal.tsx          # Create savings goal modal
│   │   └── add-account.tsx       # Add bank account modal
│   ├── auth/
│   │   ├── login.tsx             # Login screen
│   │   └── register.tsx          # Registration screen
│   └── _layout.tsx               # Root layout with auth guard
│
├── components/
│   ├── transactions/
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionList.tsx
│   │   └── TransactionFilters.tsx
│   ├── budgets/
│   │   ├── BudgetProgressBar.tsx
│   │   └── CategoryBudgetCard.tsx
│   ├── reports/
│   │   ├── SpendingPieChart.tsx
│   │   ├── MonthlyBarChart.tsx
│   │   └── DailyLineChart.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalProgressRing.tsx
│   ├── common/
│   │   ├── CategoryPicker.tsx
│   │   ├── AmountInput.tsx
│   │   ├── DatePicker.tsx
│   │   ├── CurrencySelector.tsx
│   │   └── EmptyState.tsx
│   └── dashboard/
│       ├── BalanceSummaryCard.tsx
│       ├── RecentTransactions.tsx
│       └── BudgetAlertBanner.tsx
│
├── services/
│   ├── firebase.ts               # Firebase config & init
│   ├── transactions.ts           # Firestore CRUD for transactions
│   ├── categories.ts             # Firestore CRUD for categories
│   ├── budgets.ts                # Budget read/write logic
│   ├── goals.ts                  # Savings goals logic
│   ├── accounts.ts               # Account management
│   ├── notifications.ts          # Expo push notifications
│   ├── export.ts                 # CSV / PDF export
│   └── currency.ts               # Exchange rate fetching
│
├── store/
│   ├── authStore.ts              # Auth state (user, loading)
│   ├── transactionStore.ts       # Transactions state
│   ├── categoryStore.ts          # Categories state
│   ├── budgetStore.ts            # Budget state
│   └── settingsStore.ts          # App settings (currency, theme)
│
├── hooks/
│   ├── useTransactions.ts        # Firestore real-time listener
│   ├── useMonthlyReport.ts       # Aggregated monthly data
│   ├── useBudgetStatus.ts        # Per-category budget % used
│   └── useCurrency.ts            # Currency formatting
│
├── utils/
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   ├── calculateBudget.ts
│   └── groupByCategory.ts
│
├── constants/
│   ├── colors.ts                 # Design tokens
│   ├── categories.ts             # Default category list
│   └── currencies.ts             # Supported currencies
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── assets/
│   ├── fonts/
│   └── images/
│
├── .env                          # Environment variables (never commit)
├── app.json                      # Expo config
├── firebase.json                 # Firebase config
└── package.json
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9+ or **yarn** v1.22+
- **Expo CLI** — `npm install -g expo-cli`
- **Git**
- **Expo Go** app on your phone (for testing), or Android Studio / Xcode for emulators
- A **Firebase** project (free Spark plan is sufficient)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/finance-app.git
cd finance-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Expo dependencies

```bash
npx expo install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated \
  @react-native-async-storage/async-storage \
  expo-notifications \
  expo-file-system \
  expo-sharing \
  expo-local-authentication \
  expo-status-bar
```

### 4. Install Firebase

```bash
npm install firebase
```

### 5. Install remaining packages

```bash
npm install \
  zustand \
  react-native-paper \
  react-native-gifted-charts \
  react-native-svg \
  @expo/vector-icons \
  date-fns \
  react-native-modal \
  react-native-keyboard-aware-scroll-view
```

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter a name (e.g. `financeflow`)
3. Disable Google Analytics (optional) → **Create project**

### Step 2: Add a Web App (for React Native)

1. In your project dashboard, click the **Web** icon (`</>`)
2. Register the app with a nickname (e.g. `finance-app`)
3. Copy the `firebaseConfig` object — you'll need it in the next step

### Step 3: Enable Firestore

1. In the Firebase console, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a region close to your users → **Enable**

### Step 4: Enable Authentication

1. Go to **Build → Authentication → Get started**
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (optional)
   - **Apple** (optional, for iOS)

### Step 5: Set Firestore Security Rules

In **Firestore → Rules**, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures each user can only access their own data.

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

Get a free exchange rate API key at [exchangerate-api.com](https://www.exchangerate-api.com) (1,500 requests/month free).

Then initialize Firebase in `services/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## Running the App

### Development (Expo Go)

```bash
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone.

### iOS Simulator (macOS only)

```bash
npx expo run:ios
```

### Android Emulator

```bash
npx expo run:android
```

### Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## Database Schema

All data is stored under `users/{userId}/` in Firestore to keep data isolated per user.

### transactions

```
users/{userId}/transactions/{transactionId}
├── id:          string        (auto-generated)
├── amount:      number        (always positive)
├── type:        "income" | "expense"
├── categoryId:  string        (ref to categories)
├── accountId:   string        (ref to accounts)
├── note:        string
├── tags:        string[]
├── date:        Timestamp
├── createdAt:   Timestamp
├── recurring:   boolean
└── recurrence?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly"
      nextDate:  Timestamp
    }
```

### categories

```
users/{userId}/categories/{categoryId}
├── id:           string
├── name:         string
├── icon:         string        (icon name from @expo/vector-icons)
├── color:        string        (hex color)
├── monthlyLimit: number | null
├── isDefault:    boolean
└── archived:     boolean
```

### accounts

```
users/{userId}/accounts/{accountId}
├── id:       string
├── name:     string            (e.g. "Chase Checking")
├── type:     "cash" | "bank" | "credit" | "savings"
├── balance:  number
├── currency: string            (ISO 4217, e.g. "USD")
└── color:    string
```

### budgets

```
users/{userId}/budgets/{year-month}     (e.g. "2026-06")
└── {categoryId}: number               (total spent in that category this month)
```

### goals

```
users/{userId}/goals/{goalId}
├── id:            string
├── name:          string
├── targetAmount:  number
├── savedAmount:   number
├── currency:      string
├── deadline:      Timestamp | null
├── icon:          string
├── color:         string
└── completed:     boolean
```

### settings

```
users/{userId}/settings/preferences
├── currency:          string   (default "USD")
├── theme:             "light" | "dark" | "system"
├── notifications:     boolean
├── biometricLock:     boolean
├── weekStartsOn:      0 | 1    (0 = Sunday, 1 = Monday)
└── budgetRollover:    boolean
```

---

## App Screens

### Dashboard

- Net balance (total income − total expenses, current month)
- Quick-add button for fast transaction entry
- Current month summary cards (income, expenses, savings rate)
- Budget alert banner if any category exceeds 80%
- Recent transactions (last 5), tap to view all

### Transactions

- Full chronological list of all transactions
- Pull-to-refresh for latest data
- Filter by: date range, category, type (income/expense), account
- Search by note or tag
- Swipe left to delete, swipe right to edit
- Grouped by date with daily subtotals

### Add / Edit Transaction (Modal)

- Large amount input with numpad
- Toggle: Income / Expense
- Category picker (scrollable grid with icons)
- Account picker
- Date picker (defaults to today)
- Note field (optional)
- Tags input (optional)
- Recurring toggle with frequency selector
- Save / Cancel buttons

### Budgets

- Total monthly budget progress bar at top
- Per-category cards with progress bars
- Color changes based on % used: green → yellow → red
- Tap a category to see all transactions in it this month
- Edit budget limit inline
- "Add Category Budget" button

### Reports

- Month selector at top (swipe or tap arrows)
- Summary row: total income, total expenses, net
- Pie chart: spending by category (tap slice for details)
- Bar chart: last 6 months comparison
- Line chart: spending day-by-day this month
- Top 3 categories highlight
- "Export this month" button (CSV or PDF)

### Savings Goals

- Goal cards in a vertical list
- Progress ring showing % saved
- Amount saved / target amount
- Days remaining until deadline
- Quick-add button to put money toward a goal
- Completed goals with confetti animation

### Settings

- Profile (display name, avatar)
- Default currency with live rate
- Theme (Light / Dark / System)
- Manage categories (add, edit, archive)
- Manage accounts
- Notification preferences
  - Budget alerts
  - Bill reminders
  - Weekly digest
- Biometric lock toggle
- Week start day (Sun / Mon)
- Budget rollover toggle
- Export all data (JSON backup)
- Sign out
- Delete account

---

## API & Services

### `services/transactions.ts`

```typescript
// Add a new transaction
addTransaction(userId: string, data: TransactionInput): Promise<string>

// Get all transactions for a user (real-time listener)
subscribeToTransactions(userId: string, callback: (txs: Transaction[]) => void): Unsubscribe

// Get transactions for a specific month
getMonthlyTransactions(userId: string, year: number, month: number): Promise<Transaction[]>

// Update a transaction
updateTransaction(userId: string, txId: string, data: Partial<Transaction>): Promise<void>

// Delete a transaction
deleteTransaction(userId: string, txId: string): Promise<void>
```

### `services/budgets.ts`

```typescript
// Get budget usage for a month
getMonthBudget(userId: string, yearMonth: string): Promise<BudgetData>

// Update spent amount for a category
updateCategorySpent(userId: string, yearMonth: string, categoryId: string, amount: number): Promise<void>

// Get budget status (% used per category)
getBudgetStatus(userId: string, yearMonth: string): Promise<CategoryBudgetStatus[]>
```

### `services/export.ts`

```typescript
// Export transactions as CSV file
exportToCSV(transactions: Transaction[], filename: string): Promise<void>

// Export monthly report as PDF
exportToPDF(reportData: MonthlyReport): Promise<void>

// Export all data as JSON backup
exportAllData(userId: string): Promise<void>
```

---

## State Management

We use **Zustand** for global state. Each store manages one domain.

### transactionStore

```typescript
interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (userId: string) => void;
  addTransaction: (data: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Computed
  getMonthlyTransactions: (year: number, month: number) => Transaction[];
  getTotalByType: (type: "income" | "expense", month?: number) => number;
  getByCategory: (categoryId: string) => Transaction[];
}
```

### settingsStore

```typescript
interface SettingsStore {
  currency: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  biometricLock: boolean;

  setCurrency: (currency: string) => void;
  setTheme: (theme: string) => void;
  toggleNotifications: () => void;
  toggleBiometricLock: () => void;
}
```

---

## Push Notifications

We use **Expo Notifications** for all alerts.

### Setup

```typescript
// In app startup
import * as Notifications from "expo-notifications";

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
```

### Notification Types

| Type            | Trigger                       | Default       |
| --------------- | ----------------------------- | ------------- |
| Budget Warning  | Category reaches 80% of limit | Enabled       |
| Budget Exceeded | Category goes over limit      | Enabled       |
| Bill Reminder   | X days before due date        | 3 days before |
| Weekly Digest   | Every Sunday at 8 PM          | Enabled       |
| Monthly Report  | 1st of each month             | Enabled       |

### Scheduling a Bill Reminder

```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "💳 Bill Due Soon",
    body: `Your ${billName} of ${amount} is due in ${daysLeft} days`,
  },
  trigger: {
    date: reminderDate,
  },
});
```

---

## Exporting Data

### CSV Export

Generates a `.csv` file with columns:
`Date, Type, Category, Account, Amount, Currency, Note, Tags`

```typescript
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const csv = transactions
  .map((tx) => `${tx.date},${tx.type},${tx.category},${tx.amount}`)
  .join("\n");

const path = FileSystem.documentDirectory + "transactions.csv";
await FileSystem.writeAsStringAsync(path, csv);
await Sharing.shareAsync(path);
```

### JSON Backup

Exports all Firestore data as a single `.json` file for safekeeping or migration.

---

## Firebase Free Tier Limits (Spark Plan)

| Resource          | Free Limit    | Typical Usage             |
| ----------------- | ------------- | ------------------------- |
| Firestore reads   | 50,000 / day  | ~500 reads/day for 1 user |
| Firestore writes  | 20,000 / day  | ~50 writes/day for 1 user |
| Firestore deletes | 20,000 / day  | Rarely reached            |
| Firestore storage | 1 GB          | Years of transactions     |
| Auth users        | Unlimited     | N/A                       |
| Hosting           | 10 GB / month | N/A                       |

The free tier is more than sufficient for personal use and even small families.

---

## Roadmap

### Phase 1 — MVP ✅

- [x] Project setup with Expo + TypeScript
- [ ] Firebase Auth (email/password)
- [ ] Add / view / delete transactions
- [ ] Default categories
- [ ] Dashboard with balance summary

### Phase 2 — Core Features

- [ ] Monthly reports with charts
- [ ] Budget limits and progress bars
- [ ] Recurring transactions (auto-log)
- [ ] Dark mode

### Phase 3 — Power Features

- [ ] Savings goals
- [ ] Push notifications (budget alerts, bill reminders)
- [ ] CSV + PDF export
- [ ] Multi-account support
- [ ] Multi-currency with live rates

### Phase 4 — Advanced

- [ ] Google / Apple Sign-In
- [ ] Biometric lock
- [ ] AI spending insights (Claude API integration)
- [ ] Widget support (iOS / Android)
- [ ] Shared budgets (family mode)
- [ ] Bank import via CSV (e.g. from your bank export)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear commits
4. Ensure TypeScript types are correct: `npx tsc --noEmit`
5. Open a Pull Request with a clear description

### Code Style

- TypeScript strict mode enabled
- Use functional components with hooks
- Zustand for state, never `useState` for global data
- Firestore writes always go through the `services/` layer
- All screens must handle loading and error states

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 FinanceFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

> Built with ❤️ using React Native, Expo, and Firebase.
