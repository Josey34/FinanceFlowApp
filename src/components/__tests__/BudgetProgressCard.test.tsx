import { render } from "@testing-library/react-native";
import { describe, it, expect } from "vitest";
import BudgetProgressCard from "../BudgetProgressCard";
import type { Category } from "@/types";

const baseCat: Category = {
  id: "food",
  name: "Food",
  icon: "restaurant",
  color: "#7C6FFF",
  monthlyLimit: 1000,
  isDefault: true,
  archived: false,
  spent: 250,
};

describe("BudgetProgressCard", () => {
  it("renders category name", async () => {
    const { getByText } = await render(<BudgetProgressCard category={baseCat} />);
    expect(getByText("Food")).toBeTruthy();
  });

  it("renders percentage badge", async () => {
    const { getByText } = await render(<BudgetProgressCard category={baseCat} />);
    expect(getByText("25%")).toBeTruthy();
  });

  it("renders spent amount", async () => {
    const { getByText } = await render(<BudgetProgressCard category={baseCat} />);
    expect(getByText("$250.00 spent")).toBeTruthy();
  });

  it("renders remaining amount", async () => {
    const { getByText } = await render(<BudgetProgressCard category={baseCat} />);
    expect(getByText("$750.00 left")).toBeTruthy();
  });

  it("shows 0% when limit is null", async () => {
    const cat = { ...baseCat, monthlyLimit: null };
    const { getByText } = await render(<BudgetProgressCard category={cat} />);
    expect(getByText("0%")).toBeTruthy();
  });

  it("caps at 100% when over budget", async () => {
    const cat = { ...baseCat, spent: 1500, monthlyLimit: 1000 };
    const { getByText } = await render(<BudgetProgressCard category={cat} />);
    expect(getByText("100%")).toBeTruthy();
  });

  it("includes rollover amount in limit", async () => {
    const cat = { ...baseCat, monthlyLimit: 1000, spent: 500 };
    const { getByText } = await render(<BudgetProgressCard category={cat} rolloverAmount={200} />);
    expect(getByText("42%")).toBeTruthy();
  });

  it("shows negative remaining as 0", async () => {
    const cat = { ...baseCat, spent: 1200, monthlyLimit: 1000 };
    const { getByText } = await render(<BudgetProgressCard category={cat} />);
    expect(getByText("$0.00 left")).toBeTruthy();
  });
});
