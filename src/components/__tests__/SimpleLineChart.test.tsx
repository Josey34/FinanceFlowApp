import { render } from "@testing-library/react-native";
import { describe, it, expect } from "vitest";
import SimpleLineChart from "../SimpleLineChart";

describe("SimpleLineChart", () => {
  const data = [
    { day: 1, amount: 100 },
    { day: 15, amount: 200 },
    { day: 30, amount: 150 },
  ];

  it("renders empty state when no data", async () => {
    const { getByText } = await render(<SimpleLineChart data={[]} />);
    expect(getByText("No spending data")).toBeTruthy();
  });

  it("renders x-axis labels", async () => {
    const { getByText } = await render(<SimpleLineChart data={data} />);
    expect(getByText("1")).toBeTruthy();
    expect(getByText("30")).toBeTruthy();
  });
});
