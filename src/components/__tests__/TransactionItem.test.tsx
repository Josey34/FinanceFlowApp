import { render } from "@testing-library/react-native";
import { describe, it, expect } from "vitest";
import TransactionItem from "../TransactionItem";
import type { Transaction } from "@/types";

const expenseTx: Transaction = {
  id: "1",
  amount: -45.5,
  type: "expense",
  categoryId: "food",
  accountId: "acc1",
  note: "",
  tags: [],
  date: "2026-06-15",
  createdAt: "2026-06-15T00:00:00.000Z",
  recurring: false,
  merchant: "Starbucks",
  icon: "restaurant",
  iconBg: "#7C6FFF",
  category: "Food",
};

const incomeTx: Transaction = {
  ...expenseTx,
  id: "2",
  amount: 2500,
  type: "income",
  merchant: "Salary",
  category: "Income",
  categoryId: "income",
};

describe("TransactionItem", () => {
  it("renders merchant name", async () => {
    const { getByText } = await render(<TransactionItem transaction={expenseTx} />);
    expect(getByText("Starbucks")).toBeTruthy();
  });

  it("renders category name", async () => {
    const { getByText } = await render(<TransactionItem transaction={expenseTx} />);
    expect(getByText("Food")).toBeTruthy();
  });

  it("renders expense amount with minus prefix", async () => {
    const { getByText } = await render(<TransactionItem transaction={expenseTx} />);
    expect(getByText("-$45.50")).toBeTruthy();
  });

  it("renders income amount with plus prefix", async () => {
    const { getByText } = await render(<TransactionItem transaction={incomeTx} />);
    expect(getByText("+$2500.00")).toBeTruthy();
  });

  it("renders income merchant", async () => {
    const { getByText } = await render(<TransactionItem transaction={incomeTx} />);
    expect(getByText("Salary")).toBeTruthy();
  });

  it("triggers onPress when pressed", async () => {
    let pressed = false;
    const { getByText } = await render(
      <TransactionItem
        transaction={expenseTx}
        onPress={() => { pressed = true; }}
      />,
    );
    const el = getByText("Starbucks");
    const touchable = el.parent?.parent;
    if (touchable?.props.onPress) {
      touchable.props.onPress();
    }
    expect(pressed).toBe(true);
  });
});
