import { prevMonth, todayStr } from "../src/utils/formatDate";

describe("formatDate", () => {
  it("todayStr returns YYYY-MM-DD", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("prevMonth subtracts one month", () => {
    expect(prevMonth("2026-06-01")).toBe("2026-05");
    expect(prevMonth("2026-01-15")).toBe("2025-12");
  });
});
