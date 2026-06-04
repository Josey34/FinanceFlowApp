const API_KEY = process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

let rateCache: Record<string, Record<string, number>> = {};

export async function getExchangeRates(base = 'USD'): Promise<Record<string, number>> {
  if (rateCache[base]) return rateCache[base];
  try {
    const res = await fetch(`${BASE_URL}/${base}`);
    const data = await res.json();
    if (data.result === 'success') {
      rateCache[base] = data.conversion_rates;
      return data.conversion_rates;
    }
  } catch {
    // Network error — return empty, caller handles fallback
  }
  return {};
}

export function convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const rate = rates[to];
  if (!rate) return amount;
  return amount * rate;
}
