import { describe, it, expect } from "vitest";
import {
  todayStr,
  prevMonth,
  nextMonth,
  getYearMonth,
  getMonthLabel,
  isSameMonth,
  addMonths,
  formatYearMonth,
  getDaysInMonth,
  formatDate,
  formatShortDate,
} from "../formatDate";

describe("todayStr", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("prevMonth", () => {
  it("subtracts one month within year", () => {
    expect(prevMonth("2026-06")).toBe("2026-05");
  });
  it("wraps to previous year from January", () => {
    expect(prevMonth("2026-01")).toBe("2025-12");
  });
});

describe("nextMonth", () => {
  it("adds one month within year", () => {
    expect(nextMonth("2026-05")).toBe("2026-06");
  });
  it("wraps to next year from December", () => {
    expect(nextMonth("2026-12")).toBe("2027-01");
  });
});

describe("getYearMonth", () => {
  it("extracts YYYY-MM from date string", () => {
    expect(getYearMonth("2026-06-15")).toBe("2026-06");
    expect(getYearMonth("2026-01-01")).toBe("2026-01");
  });
});

describe("isSameMonth", () => {
  it("returns true for same month", () => {
    expect(isSameMonth("2026-06-01", "2026-06-30")).toBe(true);
  });
  it("returns false for different months", () => {
    expect(isSameMonth("2026-06-01", "2026-07-01")).toBe(false);
  });
});

describe("addMonths", () => {
  it("adds positive months", () => {
    expect(addMonths("2026-01-15", 2)).toBe("2026-03-15");
  });
  it("subtracts months with negative", () => {
    expect(addMonths("2026-03-15", -1)).toBe("2026-02-15");
  });
});

describe("getMonthLabel", () => {
  it("returns long month name with year", () => {
    expect(getMonthLabel("2026-06-15")).toBe("June 2026");
  });
});

describe("formatYearMonth", () => {
  it("formats YYYY-MM to readable label", () => {
    expect(formatYearMonth("2026-06")).toBe("June 2026");
    expect(formatYearMonth("2026-01")).toBe("January 2026");
  });
});

describe("getDaysInMonth", () => {
  it("returns correct days for June (30)", () => {
    expect(getDaysInMonth("2026-06")).toBe(30);
  });
  it("returns correct days for January (31)", () => {
    expect(getDaysInMonth("2026-01")).toBe(31);
  });
  it("returns 29 for leap year February", () => {
    expect(getDaysInMonth("2024-02")).toBe(29);
  });
  it("returns 28 for non-leap February", () => {
    expect(getDaysInMonth("2025-02")).toBe(28);
  });
});

describe("formatDate", () => {
  it("formats ISO date to readable", () => {
    expect(formatDate("2026-06-15")).toBe("Jun 15, 2026");
  });
});

describe("formatShortDate", () => {
  it("formats without year", () => {
    expect(formatShortDate("2026-06-15")).toBe("Jun 15");
  });
});
