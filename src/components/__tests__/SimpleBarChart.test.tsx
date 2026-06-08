import { render } from "@testing-library/react-native";
import { describe, it, expect } from "vitest";
import SimpleBarChart from "../SimpleBarChart";

describe("SimpleBarChart", () => {
  const data = [
    { month: "Jan", income: 3000, expense: 2000 },
    { month: "Feb", income: 2500, expense: 1800 },
  ];

  it("renders legend items", async () => {
    const { getByText } = await render(<SimpleBarChart data={data} />);
    expect(getByText("Income")).toBeTruthy();
    expect(getByText("Expenses")).toBeTruthy();
  });

  it("renders month labels", async () => {
    const { getByText } = await render(<SimpleBarChart data={data} />);
    expect(getByText("Jan")).toBeTruthy();
    expect(getByText("Feb")).toBeTruthy();
  });

  it("handles single data point", async () => {
    const { getByText } = await render(
      <SimpleBarChart data={[{ month: "Mar", income: 1000, expense: 500 }]} />,
    );
    expect(getByText("Mar")).toBeTruthy();
  });

  it("handles all-zero data", async () => {
    const { getByText } = await render(
      <SimpleBarChart data={[{ month: "Apr", income: 0, expense: 0 }]} />,
    );
    expect(getByText("Apr")).toBeTruthy();
  });
});
