import React, { useState } from 'react';
import { GroceryPost, Achievement } from '../../shared/types.js';
import { calculatePoints, isCorrectGuess, getAccuracyFeedback } from '../../shared/utils/scoring.js';
import { validateGuess } from '../../shared/utils/validation.js';

interface GuessModalProps {
  isOpen: boolean;
  onClose: () => void;
  groceryPost: GroceryPost;
  currentUsername: string;
  onCorrectGuess: () => void;
  onAchievementUnlocked: (achievements: Achievement[]) => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  isOpen,
  onClose,
  groceryPost,
  currentUsername,
  onCorrectGuess,
  onAchievementUnlocked,
}) => {
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const submitGuess = async () => {
    if (isLoading || hasSubmitted) return;

    // Validation
    const validationErrors = validateGuess(guess);
    if (validationErrors.length > 0) {
      alert(validationErrors[0]!.message);
      return;
    }

    setIsLoading(true);

    try {
      const guessValue = parseFloat(guess);
      
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: groceryPost.postId,
          guess: guessValue,
          username: currentUsername,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.achievements) {
          onAchievementUnlocked(result.achievements);
        }

        const feedbackMessage = getAccuracyFeedback(guessValue, groceryPost.convertedTotalUSD);
        setFeedback(feedbackMessage);
        setHasSubmitted(true);

        const isCorrect = isCorrectGuess(guessValue, groceryPost.convertedTotalUSD);
        if (isCorrect) {
          setTimeout(() => {
            onCorrectGuess();
            onClose();
          }, 2000);
        }
      } else {
        throw new Error('Failed to submit guess');
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      alert('Failed to submit guess. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const giveUp = async () => {
    if (isLoading) return;

    try {
      await fetch('/api/give-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: groceryPost.postId,
          username: currentUsername,
        }),
      });

      onCorrectGuess();
    } catch (error) {
      console.error('Failed to give up:', error);
      onCorrectGuess(); // Still allow them to see the answer
    }
  };

  const resetAndClose = () => {
    setGuess('');
    setFeedback('');
    setHasSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-4">🎯 Make Your Guess!</h2>
        
        <div className="text-center mb-6">
          <p className="mb-2">What do you think this grocery haul cost?</p>
          <p className="text-sm text-gray-600">Enter your guess in USD</p>
        </div>

        {/* Receipt Summary */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm font-bold text-center mb-2">Quick Recap:</p>
          <p className="text-sm text-center">
            {groceryPost.originalPrices.length} items from {groceryPost.location}
          </p>
          <p className="text-sm text-center">
            Original currency: {groceryPost.originalCurrency}
          </p>
        </div>

        {!hasSubmitted ? (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Your guess (USD):</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount like 42.50"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={giveUp}
                disabled={isLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium"
              >
                Give Up 😔
              </button>
              <button
                onClick={submitGuess}
                disabled={!guess || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium"
              >
                {isLoading ? 'Submitting...' : 'Submit Guess 🚀'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className={`p-4 rounded-md mb-4 ${
              feedback.includes('Correct') 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-lg font-bold mb-2 ${
                feedback.includes('Correct') ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback}
              </p>
              <p className="text-sm">Your guess: ${parseFloat(guess).toFixed(2)}</p>
              <p className="text-sm">Actual total: ${groceryPost.convertedTotalUSD.toFixed(2)}</p>
            </div>
            
            <button
              onClick={() => {
                onCorrectGuess();
                resetAndClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium"
            >
              View Full Receipt 📄
            </button>
          </div>
        )}

        <button
          onClick={resetAndClose}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium"
        >
          {hasSubmitted ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  );
};