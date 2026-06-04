const ICON_MIGRATION: Record<string, string> = {
  "🍕": "restaurant",
  "🛍": "bag-handle",
  "🛍️": "bag-handle",
  "💊": "medkit",
  "🚗": "car",
  "🎭": "film",
  "🏠": "home",
  "💰": "wallet",
  "✈️": "airplane",
  "💻": "laptop",
  "🎵": "musical-notes",
  "🏷": "pricetag",
  "🍔": "fast-food",
  "☕": "cafe",
  "🎮": "game-controller",
  "💵": "cash",
  "🎯": "flag",
  "🏦": "business",
  "💳": "card",
  "🏧": "wallet",
  "📚": "book",
  "🗑": "trash",
};

function normalizeIcon(icon: string): string {
  return icon.replace(/\uFE0F/g, "");
}

export function mapCategoryIcon(icon: string): string {
  const normalized = normalizeIcon(icon);
  return ICON_MIGRATION[normalized] ?? ICON_MIGRATION[icon] ?? normalized;
}

export function getSafeIoniconName(
  icon: string | undefined,
  fallback: string,
): string {
  if (!icon) return fallback;
  const normalized = normalizeIcon(icon);
  return /^[a-z0-9-]+$/i.test(normalized) ? normalized : fallback;
}
