import { render } from "@testing-library/react-native";
import { describe, it, expect } from "vitest";
import BalanceCard from "../BalanceCard";

describe("BalanceCard", () => {
  it("renders total balance heading", async () => {
    const { getByText } = await render(<BalanceCard balance={1500} />);
    expect(getByText("Total Balance")).toBeTruthy();
  });

  it("renders formatted balance", async () => {
    const { getByText } = await render(<BalanceCard balance={1500} />);
    expect(getByText("$1500.00")).toBeTruthy();
  });

  it("renders default holder name when not provided", async () => {
    const { getByText } = await render(<BalanceCard balance={0} />);
    expect(getByText("User")).toBeTruthy();
  });

  it("renders custom holder name", async () => {
    const { getByText } = await render(<BalanceCard balance={0} holderName="Alice" />);
    expect(getByText("Alice")).toBeTruthy();
  });

  it("renders account count for single account", async () => {
    const { getByText } = await render(<BalanceCard balance={0} accountCount={1} />);
    expect(getByText("1 account")).toBeTruthy();
  });

  it("renders account count for multiple accounts", async () => {
    const { getByText } = await render(<BalanceCard balance={0} accountCount={3} />);
    expect(getByText("3 accounts")).toBeTruthy();
  });

  it("shows no accounts text when count is 0", async () => {
    const { getByText } = await render(<BalanceCard balance={0} accountCount={0} />);
    expect(getByText("No accounts")).toBeTruthy();
  });

  it("renders FinanceFlow branding", async () => {
    const { getByText } = await render(<BalanceCard balance={0} />);
    expect(getByText("FinanceFlow")).toBeTruthy();
  });

  it("renders negative balance", async () => {
    const { getByText } = await render(<BalanceCard balance={-500} />);
    expect(getByText("$-500.00")).toBeTruthy();
  });
});
