import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { getExchangeRates, convert } from '../services/currency';
import { formatCurrency } from '../utils/formatCurrency';

interface UseCurrencyReturn {
  format: (amount: number, fromCurrency?: string) => string;
  convert: (amount: number, from: string) => number;
  rates: Record<string, number>;
  loading: boolean;
}

export function useCurrency(): UseCurrencyReturn {
  const { currency } = useSettingsStore();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getExchangeRates(currency)
      .then(setRates)
      .finally(() => setLoading(false));
  }, [currency]);

  const convertAmount = useCallback(
    (amount: number, from: string) => convert(amount, from, currency, rates),
    [currency, rates],
  );

  const format = useCallback(
    (amount: number, fromCurrency = currency) => {
      const converted = fromCurrency === currency ? amount : convertAmount(amount, fromCurrency);
      return formatCurrency(converted, currency);
    },
    [currency, convertAmount],
  );

  return { format, convert: convertAmount, rates, loading };
}
