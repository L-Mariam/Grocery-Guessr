import React, { useState } from 'react';
import { GroceryPost, UserProfile, ValidationError, Achievement } from '../../shared/types.js';
import { convertToUSD, formatCurrency, getSupportedCurrencies } from '../../shared/utils/currency.js';
import { validateReceiptItems, validateLocation, validateCurrency } from '../../shared/utils/validation.js';

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  currentUsername: string;
  onAchievementUnlocked: (achievements: Achievement[]) => void;
  onPostCreated: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  isOpen,
  onClose,
  postId,
  currentUsername,
  onAchievementUnlocked,
  onPostCreated
}) => {
  const [items, setItems] = useState<{ item: string; qty: number; price: number }[]>([]);
  const [currentItem, setCurrentItem] = useState('');
  const [currentQty, setCurrentQty] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const convertedTotal = convertToUSD(subtotal, currency);

  const addItem = () => {
    if (currentItem && currentPrice > 0) {
      setItems([...items, { item: currentItem.trim(), qty: currentQty, price: currentPrice }]);
      setCurrentItem('');
      setCurrentQty(1);
      setCurrentPrice(0);
      setErrors([]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const submitPost = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrors([]);

    try {
      // Validation
      const itemErrors = validateReceiptItems(items);
      const locationErrors = validateLocation(country, city);
      const currencyErrors = validateCurrency(currency);
      
      const allErrors = [...itemErrors, ...locationErrors, ...currencyErrors];
      
      if (allErrors.length > 0) {
        setErrors(allErrors);
        return;
      }

      const postData = {
        items,
        currency,
        location: `${city.trim()}, ${country.trim()}`,
        convertedTotal,
        posterUsername: currentUsername
      };

      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.achievements) {
          onAchievementUnlocked(result.achievements);
        }
        onPostCreated();
        onClose();
        
        // Reset form
        setItems([]);
        setCurrentItem('');
        setCurrentQty(1);
        setCurrentPrice(0);
        setCurrency('USD');
        setCountry('');
        setCity('');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Failed to submit post:', error);
      setErrors([{ field: 'general', message: 'Failed to post. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center mb-6">📄 Post Your Haul</h2>
        
        {/* Add Item Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Add Items:</h3>
          
          <div className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-6">
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input
                type="text"
                placeholder="Enter item name"
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={currentQty}
                onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentPrice > 0 ? currentPrice : ''}
                onChange={(e) => setCurrentPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <button
                onClick={addItem}
                disabled={!currentItem || currentPrice <= 0 || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-md font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <div className="flex flex-wrap gap-2">
              {getSupportedCurrencies().map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currency === curr
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Receipt Preview */}
        {items.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono text-sm">
              <div className="text-center font-bold border-b pb-2 mb-3">
                ================================<br/>
                RECEIPT PREVIEW<br/>
                ================================
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span>{item.qty}x {item.item}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatCurrency(item.qty * item.price, currency)}</span>
                    <button
                      onClick={() => removeItem(index)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="text-center text-xs mt-1">
                  (≈ ${convertedTotal.toFixed(2)} USD)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Input */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              placeholder="United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              placeholder="New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-2">Please fix these errors:</p>
            <ul className="text-sm text-red-600 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submitPost}
            disabled={items.length === 0 || !country || !city || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium"
          >
            {isLoading ? 'Posting...' : 'Submit Haul 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};