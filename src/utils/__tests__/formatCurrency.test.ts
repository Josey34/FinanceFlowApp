import { describe, it, expect } from "vitest";
import { getCurrencySymbol, LOCALE_MAP } from "../formatCurrency";

describe("LOCALE_MAP", () => {
  it("maps major currencies to locales", () => {
    expect(LOCALE_MAP.USD).toBe("en-US");
    expect(LOCALE_MAP.EUR).toBe("de-DE");
    expect(LOCALE_MAP.JPY).toBe("ja-JP");
    expect(LOCALE_MAP.GBP).toBe("en-GB");
  });
});

describe("getCurrencySymbol", () => {
  it("returns $ for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  it("returns € for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  it("returns £ for GBP", () => {
    expect(getCurrencySymbol("GBP")).toBe("£");
  });

  it("returns yen sign for JPY", () => {
    const sym = getCurrencySymbol("JPY");
    expect(["¥", "￥", "JPY"]).toContain(sym);
  });

  it("returns currency code for unknown currency", () => {
    expect(getCurrencySymbol("XYZ")).toBe("XYZ");
  });
});
