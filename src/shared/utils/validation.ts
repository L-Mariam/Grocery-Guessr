import { ValidationError } from '../types.js';
import { getSupportedCurrencies } from './currency.js';

export const validateItem = (
  item: string, 
  quantity: number, 
  price: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!item || item.trim().length === 0) {
    errors.push({ field: 'item', message: 'Item name is required' });
  } else if (item.length > 50) {
    errors.push({ field: 'item', message: 'Item name must be 50 characters or less' });
  }

  if (quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
  } else if (quantity > 999) {
    errors.push({ field: 'quantity', message: 'Quantity cannot exceed 999' });
  } else if (!Number.isInteger(quantity)) {
    errors.push({ field: 'quantity', message: 'Quantity must be a whole number' });
  }

  if (price <= 0) {
    errors.push({ field: 'price', message: 'Price must be greater than 0' });
  } else if (price > 999999) {
    errors.push({ field: 'price', message: 'Price cannot exceed 999,999' });
  }

  return errors;
};

export const validateLocation = (country: string, city: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!country || country.trim().length === 0) {
    errors.push({ field: 'country', message: 'Country is required' });
  } else if (country.length > 50) {
    errors.push({ field: 'country', message: 'Country must be 50 characters or less' });
  }

  if (!city || city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  } else if (city.length > 50) {
    errors.push({ field: 'city', message: 'City must be 50 characters or less' });
  }

  return errors;
};

export const validateCurrency = (currency: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const supportedCurrencies = getSupportedCurrencies();

  if (!supportedCurrencies.includes(currency)) {
    errors.push({ 
      field: 'currency', 
      message: `Currency ${currency} is not supported` 
    });
  }

  return errors;
};

export const validateGuess = (guess: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!guess || guess.trim().length === 0) {
    errors.push({ field: 'guess', message: 'Guess is required' });
    return errors;
  }

  const guessValue = parseFloat(guess);
  
  if (isNaN(guessValue)) {
    errors.push({ field: 'guess', message: 'Guess must be a valid number' });
  } else if (guessValue <= 0) {
    errors.push({ field: 'guess', message: 'Guess must be greater than 0' });
  } else if (guessValue > 999999) {
    errors.push({ field: 'guess', message: 'Guess cannot exceed 999,999' });
  }

  return errors;
};

export const validateReceiptItems = (
  items: { item: string; qty: number; price: number }[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (items.length === 0) {
    errors.push({ field: 'items', message: 'At least one item is required' });
    return errors;
  }

  if (items.length > 50) {
    errors.push({ field: 'items', message: 'Cannot have more than 50 items' });
  }

  items.forEach((itemData, index) => {
    const itemErrors = validateItem(itemData.item, itemData.qty, itemData.price);
    itemErrors.forEach(error => {
      errors.push({
        field: `items[${index}].${error.field}`,
        message: `Item ${index + 1}: ${error.message}`
      });
    });
  });

  return errors;
};
