import { useSettingsStore } from '../store/settingsStore';

// Currency → locale for correct thousands/decimal separators
export const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US', AUD: 'en-AU', CAD: 'en-CA', NZD: 'en-NZ',
  GBP: 'en-GB', SGD: 'en-SG', HKD: 'en-HK',
  EUR: 'de-DE', CHF: 'de-CH',
  JPY: 'ja-JP', CNY: 'zh-CN',
  KRW: 'ko-KR',
  IDR: 'id-ID', MYR: 'ms-MY', THB: 'th-TH', PHP: 'fil-PH', VND: 'vi-VN',
  INR: 'en-IN',
  BRL: 'pt-BR', MXN: 'es-MX', ARS: 'es-AR', COP: 'es-CO',
  SEK: 'sv-SE', NOK: 'nb-NO', DKK: 'da-DK',
  RUB: 'ru-RU', TRY: 'tr-TR',
  ZAR: 'en-ZA', NGN: 'en-NG', EGP: 'ar-EG',
  SAR: 'ar-SA', AED: 'ar-AE', QAR: 'ar-QA',
};

// If narrowSymbol contains letters (Rp, kr, CHF, RM, …) use code display instead
function currencyDisplay(code: string, locale: string): 'narrowSymbol' | 'code' {
  try {
    const sym = new Intl.NumberFormat(locale, {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol',
    }).formatToParts(1).find((p) => p.type === 'currency')?.value ?? '';
    return /[a-zA-Z]/.test(sym) ? 'code' : 'narrowSymbol';
  } catch {
    return 'code';
  }
}

export function formatCurrency(amount: number, currency?: string, compact = false): string {
  const code = currency ?? useSettingsStore.getState().currency;
  const locale = LOCALE_MAP[code] ?? 'en-US';
  const display = currencyDisplay(code, locale);

  if (compact && Math.abs(amount) >= 1000) {
    const sign = amount < 0 ? '-' : '';
    const abs = Math.abs(amount);
    const sym = getCurrencySymbol(code);
    const prefix = display === 'narrowSymbol' ? sym : `${sym} `;
    if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`;
    return `${sign}${prefix}${(abs / 1000).toFixed(1)}K`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: display,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function getCurrencySymbol(code: string): string {
  const locale = LOCALE_MAP[code] ?? 'en-US';
  const display = currencyDisplay(code, locale);
  if (display === 'code') return code;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? code;
  } catch {
    return code;
  }
}

export function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const prefix = amount < 0 ? '-' : '+';
  return `${prefix}${formatCurrency(abs)}`;
}
