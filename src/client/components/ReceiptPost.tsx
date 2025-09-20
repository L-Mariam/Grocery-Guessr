import React from 'react';
import { GroceryPost } from '../../shared/types.js';

interface ReceiptPostProps {
  groceryPost: GroceryPost | null;
  currentUsername: string;
  onGuessClick: () => void;
  onViewReceiptClick: () => void;
  isLoading: boolean;
}

export const ReceiptPost: React.FC<ReceiptPostProps> = ({
  groceryPost,
  currentUsername,
  onGuessClick,
  onViewReceiptClick,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Loading receipt... 📄</h2>
        <p className="text-gray-600">Please wait while we fetch your grocery haul</p>
      </div>
    );
  }

  if (!groceryPost) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-3xl font-bold mb-6">🛒 Welcome to Grocery Guessr!</h2>
        <p className="text-lg mb-4">This post doesn't have a grocery receipt yet.</p>
        <p className="text-lg mb-6">Be the first to post your haul!</p>
        <p className="text-sm text-gray-600">
          Post your grocery receipts and let others guess the total cost.
          Earn points for accuracy and engagement!
        </p>
      </div>
    );
  }

  const isOwner = groceryPost.posterUsername === currentUsername;
  const hasGuessed = groceryPost.guesses[currentUsername] !== undefined;
  const guessCount = Object.keys(groceryPost.guesses).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🧾 GROCERY RECEIPT</h2>
        <p className="text-gray-600">{groceryPost.location}</p>
        <p className="text-gray-600">Posted by u/{groceryPost.posterUsername}</p>
        {guessCount > 0 && (
          <p className="text-gray-600">{guessCount} guess{guessCount !== 1 ? 'es' : ''} so far</p>
        )}
      </div>

      {/* Receipt Display */}
      <div className="bg-gray-50 p-6 rounded-md mx-auto max-w-md">
        <div className="font-mono text-sm text-center">
          <div className="border-b pb-3 mb-4">
            <div className="font-bold">================================</div>
            <div className="font-bold">GROCERY STORE RECEIPT</div>
            <div>{groceryPost.location}</div>
            <div className="font-bold">================================</div>
          </div>

          {/* Items List */}
          <div className="space-y-1 mb-4">
            {groceryPost.originalPrices.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.qty}x {item.item}</span>
                <span className="text-gray-400">??.??</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-bold mb-1">
              <span>TOTAL ({groceryPost.originalCurrency}):</span>
              <span className="text-gray-400">??.??</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>TOTAL (USD):</span>
              <span className="text-gray-400 font-bold">$??.??</span>
            </div>
            <div className="font-bold">================================</div>
            
            <div className="mt-3 text-xs text-gray-600">
              <div>Thank you for shopping with us!</div>
              <div>Have a great day! 😊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="text-center mt-6">
        {isOwner ? (
          <div>
            <p className="text-gray-600 mb-4">
              This is your receipt! Others can guess the total.
            </p>
            <button
              onClick={onViewReceiptClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              View Full Receipt 👁️
            </button>
          </div>
        ) : hasGuessed ? (
          <div>
<p className="text-gray-600 mb-4">
  You've already guessed: $
  {groceryPost.guesses[currentUsername]?.toFixed(2) ?? '0.00'}
</p>

            <button
              onClick={onViewReceiptClick}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              View Results 📊
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-bold mb-2">Can you guess the total cost?</p>
            <p className="text-gray-600 mb-4">
              Make your guess in USD and earn points for accuracy!
            </p>
            <button
              onClick={onGuessClick}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
            >
              Make Your Guess 🎯
            </button>
          </div>
        )}

        {/* Game Stats */}
        <div className="mt-6 bg-gray-100 p-4 rounded-md inline-block">
          <p className="text-sm font-bold mb-2">Game Stats:</p>
          <p className="text-sm">Total Items: {groceryPost.originalPrices.length}</p>
          <p className="text-sm">Currency: {groceryPost.originalCurrency}</p>
          <p className="text-sm">Location: {groceryPost.location}</p>
        </div>
      </div>
    </div>
  );
};