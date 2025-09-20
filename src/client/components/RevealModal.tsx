import React from 'react';
import { GroceryPost } from '../../shared/types.js';
import { formatCurrency } from '../../shared/utils/currency.js';

interface RevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  groceryPost: GroceryPost;
  currentUsername: string;
  onPostHaul: () => void;
}

export const RevealModal: React.FC<RevealModalProps> = ({
  isOpen,
  onClose,
  groceryPost,
  currentUsername,
  onPostHaul,
}) => {
  if (!isOpen) return null;

  const userGuess = groceryPost.guesses[currentUsername];
  const actualTotal = groceryPost.convertedTotalUSD;
  const originalTotal = groceryPost.originalPrices.reduce((sum, item) => sum + (item.qty * item.price), 0);
  
  let percentageOff: number | null = null;
  let accuracyMessage = '';
  
  if (userGuess) {
    percentageOff = Math.abs((userGuess - actualTotal) / actualTotal) * 100;
    if (percentageOff <= 1) accuracyMessage = 'Incredible accuracy! 🎯';
    else if (percentageOff <= 3) accuracyMessage = 'Excellent guess! 🎉';
    else if (percentageOff <= 5) accuracyMessage = 'Great job! 👏';
    else if (percentageOff <= 10) accuracyMessage = 'Not bad! 👍';
    else if (percentageOff <= 20) accuracyMessage = 'Close enough! 😊';
    else accuracyMessage = 'Better luck next time! 🤞';
  }

  // Calculate guess statistics
  const allGuesses = Object.values(groceryPost.guesses);
  const avgGuess = allGuesses.length > 0 ? allGuesses.reduce((sum, g) => sum + g, 0) / allGuesses.length : 0;
  const closestGuess = allGuesses.length > 0 ? allGuesses.reduce((closest, guess) => 
    Math.abs(guess - actualTotal) < Math.abs(closest - actualTotal) ? guess : closest
  ) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-6">🧾 FULL RECEIPT REVEALED!</h2>
        
        {/* Full Receipt with Real Prices */}
        <div className="bg-gray-50 p-6 rounded-lg mx-auto max-w-md mb-6">
          <div className="font-mono text-sm text-center">
            <div className="border-b pb-3 mb-4">
              <div className="font-bold">================================</div>
              <div className="font-bold">GROCERY STORE RECEIPT</div>
              <div>{groceryPost.location}</div>
              <div>{new Date(groceryPost.createdAt).toLocaleDateString()}</div>
              <div className="font-bold">================================</div>
            </div>

            {/* Items with Real Prices */}
            <div className="space-y-1 mb-4">
              {groceryPost.originalPrices.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.qty}x {item.item}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(item.qty * item.price, groceryPost.originalCurrency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between font-bold mb-2">
                <span>TOTAL ({groceryPost.originalCurrency}):</span>
                <span className="text-red-600">
                  {formatCurrency(originalTotal, groceryPost.originalCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>TOTAL (USD):</span>
                <span className="font-bold text-red-600">
                  ${actualTotal.toFixed(2)}
                </span>
              </div>
              <div className="font-bold">================================</div>
              
              <div className="mt-3 text-xs text-gray-600">
                <div>Thank you for playing!</div>
                <div>u/{groceryPost.posterUsername} 🛒</div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Guess Results */}
        {userGuess && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-center mb-3">Your Performance:</h3>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-3">
              <div>
                <p className="text-sm text-gray-600">Your guess</p>
                <p className="text-xl font-bold">${userGuess.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Actual total</p>
                <p className="text-xl font-bold">${actualTotal.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-lg font-bold text-blue-600">
                {percentageOff !== null ? `${(100 - percentageOff).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-lg font-bold text-blue-800 mt-2">
                {accuracyMessage}
              </p>
            </div>
          </div>
        )}

        {/* Community Stats */}
        {allGuesses.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-center mb-3">Community Stats:</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-600">Total guesses</p>
                <p className="font-bold">{allGuesses.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Average guess</p>
                <p className="font-bold">${avgGuess.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Closest guess</p>
                <p className="font-bold">${closestGuess.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Difference</p>
                <p className="font-bold">${Math.abs(closestGuess - actualTotal).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Enjoyed the challenge? 🎮</h3>
          <p className="text-gray-600 mb-6">
            Post your own grocery receipt and see if others can guess your total!
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                onPostHaul();
                onClose();
              }} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold text-lg"
            >
              Post Your Own Haul! 🛒✨
            </button>
            
            <button 
              onClick={onClose} 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};