import { describe, it, expect } from "vitest";
import {
  getSpentByCategory,
  getCategoryBudgetPct,
  getBudgetStatus,
  getTotalIncome,
  getTotalExpenses,
  getRolloverAmount,
} from "../calculateBudget";
import type { Transaction, Category } from "../../types";

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: "1",
  amount: 100,
  type: "expense",
  categoryId: "food",
  accountId: "acc1",
  note: "",
  tags: [],
  date: "2026-06-15",
  createdAt: "2026-06-15T00:00:00.000Z",
  recurring: false,
  merchant: "Test",
  icon: "restaurant",
  iconBg: "#000",
  category: "Food",
  ...overrides,
});

describe("getSpentByCategory", () => {
  it("groups expenses by category for given month", () => {
    const transactions = [
      tx({ categoryId: "food", amount: -50, date: "2026-06-01" }),
      tx({ categoryId: "transport", amount: -20, date: "2026-06-05" }),
      tx({ categoryId: "food", amount: -30, date: "2026-06-10" }),
    ];
    expect(getSpentByCategory(transactions, "2026-06")).toEqual({
      food: 80,
      transport: 20,
    });
  });

  it("ignores income transactions", () => {
    const transactions = [
      tx({ type: "income", categoryId: "income", amount: 1000, date: "2026-06-01" }),
      tx({ categoryId: "food", amount: -50, date: "2026-06-01" }),
    ];
    expect(getSpentByCategory(transactions, "2026-06")).toEqual({ food: 50 });
  });

  it("filters by month", () => {
    const transactions = [
      tx({ categoryId: "food", amount: -50, date: "2026-06-01" }),
      tx({ categoryId: "food", amount: -30, date: "2026-07-01" }),
    ];
    expect(getSpentByCategory(transactions, "2026-06")).toEqual({ food: 50 });
  });
});

describe("getCategoryBudgetPct", () => {
  const cat = (overrides: Partial<Category>): Category => ({
    id: "food",
    name: "Food",
    icon: "restaurant",
    color: "#000",
    monthlyLimit: 1000,
    isDefault: true,
    archived: false,
    spent: 250,
    ...overrides,
  });

  it("calculates correct percentage", () => {
    expect(getCategoryBudgetPct(cat({ spent: 250, monthlyLimit: 1000 }))).toBe(25);
  });

  it("caps at 100", () => {
    expect(getCategoryBudgetPct(cat({ spent: 1500, monthlyLimit: 1000 }))).toBe(100);
  });

  it("returns 0 when no limit", () => {
    expect(getCategoryBudgetPct(cat({ monthlyLimit: null }))).toBe(0);
  });

  it("returns 0 when limit is 0", () => {
    expect(getCategoryBudgetPct(cat({ monthlyLimit: 0 }))).toBe(0);
  });
});

describe("getBudgetStatus", () => {
  it("returns danger at 100+", () => {
    expect(getBudgetStatus(100)).toBe("danger");
    expect(getBudgetStatus(150)).toBe("danger");
  });
  it("returns warning at 80-99", () => {
    expect(getBudgetStatus(80)).toBe("warning");
    expect(getBudgetStatus(95)).toBe("warning");
  });
  it("returns safe below 80", () => {
    expect(getBudgetStatus(0)).toBe("safe");
    expect(getBudgetStatus(79)).toBe("safe");
  });
});

describe("getTotalIncome", () => {
  it("sums income for the month", () => {
    const transactions = [
      tx({ type: "income", amount: 2000, date: "2026-06-01" }),
      tx({ type: "income", amount: 500, date: "2026-06-15" }),
      tx({ type: "expense", amount: -100, date: "2026-06-10" }),
    ];
    expect(getTotalIncome(transactions, "2026-06")).toBe(2500);
  });

  it("returns 0 when no income", () => {
    expect(getTotalIncome([tx({ type: "expense" })], "2026-06")).toBe(0);
  });
});

describe("getTotalExpenses", () => {
  it("sums absolute expense amounts for the month", () => {
    const transactions = [
      tx({ amount: -100, date: "2026-06-01" }),
      tx({ amount: -50, date: "2026-06-15" }),
      tx({ type: "income", amount: 1000, date: "2026-06-10" }),
    ];
    expect(getTotalExpenses(transactions, "2026-06")).toBe(150);
  });
});

describe("getRolloverAmount", () => {
  const cat: Category = {
    id: "food", name: "Food", icon: "restaurant", color: "#000",
    monthlyLimit: 1000, isDefault: true, archived: false, spent: 0,
  };

  it("returns unspent amount from previous month", () => {
    const transactions = [
      tx({ categoryId: "food", amount: -400, date: "2026-05-10" }),
    ];
    expect(getRolloverAmount(cat, transactions, "2026-05")).toBe(600);
  });

  it("returns 0 if over budget previous month", () => {
    const transactions = [
      tx({ categoryId: "food", amount: -1200, date: "2026-05-10" }),
    ];
    expect(getRolloverAmount(cat, transactions, "2026-05")).toBe(0);
  });

  it("returns 0 when no monthly limit", () => {
    expect(getRolloverAmount(
      { ...cat, monthlyLimit: null }, [], "2026-05",
    )).toBe(0);
  });

  it("only counts the specified category", () => {
    const transactions = [
      tx({ categoryId: "food", amount: -400, date: "2026-05-10" }),
      tx({ categoryId: "transport", amount: -200, date: "2026-05-10" }),
    ];
    expect(getRolloverAmount(cat, transactions, "2026-05")).toBe(600);
  });
});
