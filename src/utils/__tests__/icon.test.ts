import { describe, it, expect } from "vitest";
import { mapCategoryIcon, getSafeIoniconName } from "../icon";

describe("mapCategoryIcon", () => {
  it("maps emoji to Ionicons name", () => {
    expect(mapCategoryIcon("🍕")).toBe("restaurant");
    expect(mapCategoryIcon("🚗")).toBe("car");
    expect(mapCategoryIcon("🏠")).toBe("home");
  });

  it("normalizes emoji with variation selector", () => {
    expect(mapCategoryIcon("✈️")).toBe("airplane");
    expect(mapCategoryIcon("🛍️")).toBe("bag-handle");
  });

  it("passes through Ionicons names unchanged", () => {
    expect(mapCategoryIcon("restaurant")).toBe("restaurant");
    expect(mapCategoryIcon("car")).toBe("car");
  });

  it("returns unknown icons as-is", () => {
    expect(mapCategoryIcon("🦄")).toBe("🦄");
    expect(mapCategoryIcon("unknown")).toBe("unknown");
  });

  it("passes through unknown strings unchanged", () => {
    expect(mapCategoryIcon("unicorn")).toBe("unicorn");
  });
});

describe("getSafeIoniconName", () => {
  it("returns valid icon name", () => {
    expect(getSafeIoniconName("home", "card")).toBe("home");
    expect(getSafeIoniconName("restaurant", "card")).toBe("restaurant");
  });

  it("returns fallback for emoji", () => {
    expect(getSafeIoniconName("🍕", "card")).toBe("card");
    expect(getSafeIoniconName("🚗", "card")).toBe("card");
  });

  it("returns fallback for undefined", () => {
    expect(getSafeIoniconName(undefined, "card")).toBe("card");
  });

  it("returns fallback for empty string", () => {
    expect(getSafeIoniconName("", "card")).toBe("card");
  });
});
