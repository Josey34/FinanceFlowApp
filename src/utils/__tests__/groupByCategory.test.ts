import { describe, it, expect } from "vitest";
import { groupByCategory, groupByDate } from "../groupByCategory";
import type { Transaction } from "../../types";

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

describe("groupByCategory", () => {
  it("groups transactions by categoryId", () => {
    const result = groupByCategory([
      tx({ id: "1", categoryId: "food" }),
      tx({ id: "2", categoryId: "transport" }),
      tx({ id: "3", categoryId: "food" }),
    ]);
    expect(Object.keys(result)).toEqual(["food", "transport"]);
    expect(result.food).toHaveLength(2);
    expect(result.transport).toHaveLength(1);
  });

  it("returns empty object for empty array", () => {
    expect(groupByCategory([])).toEqual({});
  });
});

describe("groupByDate", () => {
  it("groups transactions by date", () => {
    const result = groupByDate([
      tx({ id: "1", date: "2026-06-15" }),
      tx({ id: "2", date: "2026-06-15T12:00:00" }),
      tx({ id: "3", date: "2026-06-16" }),
    ]);
    expect(Object.keys(result)).toEqual(["2026-06-15", "2026-06-16"]);
    expect(result["2026-06-15"]).toHaveLength(2);
    expect(result["2026-06-16"]).toHaveLength(1);
  });

  it("returns empty object for empty array", () => {
    expect(groupByDate([])).toEqual({});
  });
});
