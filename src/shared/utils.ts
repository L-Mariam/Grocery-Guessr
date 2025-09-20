import { POINTS_CONFIG, EXCHANGE_RATES, CURRENCY_SYMBOLS } from './constants.js';

export const calculateGuessPoints = (accuracy: number): number => {
  const thresholds = Object.keys(POINTS_CONFIG.GUESS_ACCURACY)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (accuracy >= threshold) {
      return POINTS_CONFIG.GUESS_ACCURACY[threshold as keyof typeof POINTS_CONFIG.GUESS_ACCURACY];
    }
  }
  return 0;
};

export const calculateAccuracy = (guess: number, actual: number): number => {
  const difference = Math.abs(guess - actual);
  const percentage = Math.max(0, 100 - (difference / actual) * 100);
  return Math.round(percentage * 10) / 10;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
  return `${symbol}${amount.toFixed(2)}`;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
  const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

export const isConsecutiveDay = (lastDate: string, currentDate: string): boolean => {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const generateReceiptId = (): string => {
  return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateGuessId = (): string => {
  return `guess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};