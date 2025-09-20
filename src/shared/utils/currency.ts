// utils/currency.ts

export const EXCHANGE_RATES: { [currency: string]: number } = {
  USD: 1,
  EUR: 1.07,
  GBP: 1.25,
  CAD: 0.74,
  AUD: 0.66,
  JPY: 0.0067,
  CHF: 1.09,
  CNY: 0.14,
  INR: 0.012,
  MXN: 0.059,
};

export const CURRENCY_SYMBOLS: { [currency: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  MXN: '$',
};

export const convertToUSD = (amount: number, currency: string): number => {
  const rate = EXCHANGE_RATES[currency];
  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
};

export const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency is not supported by Intl
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const getSupportedCurrencies = (): string[] => {
  return Object.keys(EXCHANGE_RATES);
};