import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../shared/types.js';
import { getAchievementById } from '../../shared/utils/achievements.js';

interface MyHaulProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
}

export const MyHaul: React.FC<MyHaulProps> = ({
  isOpen,
  onClose,
  currentUsername,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/user/${currentUsername}`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else if (response.status === 404) {
          // User profile doesn't exist yet
          setUserProfile(null);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load your stats');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && currentUsername !== 'anonymous') {
      fetchProfile();
    } else if (isOpen) {
      setLoading(false);
    }
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  if (currentUsername === 'anonymous') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-center mb-6">📊 My Grocery Stats</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-lg mb-4">Please log in to view your stats</p>
            <p className="text-sm text-gray-600">Your progress and achievements are saved to your Reddit account</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center mb-4">📊 My Grocery Stats</h2>
        <p className="text-center text-gray-600 mb-6">u/{currentUsername}</p>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg">Loading your stats...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">Failed to load your stats</p>
            <p className="text-sm text-gray-600">Please try again later</p>
          </div>
        ) : !userProfile ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-4">Welcome to Grocery Guessr!</h3>
            <p className="text-gray-600 mb-6">You haven't started playing yet.</p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-bold mb-2">Get started by:</h4>
              <div className="text-sm space-y-1">
                <p>• Posting your first grocery receipt</p>
                <p>• Guessing totals on other posts</p>
                <p>• Earning points and achievements!</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Stats in Thermal Receipt Style */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="font-mono text-sm text-center">
                <div className="font-bold mb-2">================================</div>
                <div className="font-bold">GROCERY GUESSR STATS</div>
                <div>u/{userProfile.username}</div>
                <div>Member since: {new Date(userProfile.joinedDate).toLocaleDateString()}</div>
                <div className="font-bold mt-2 mb-4">================================</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Points:</span>
                    <span className="font-bold">{userProfile.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receipts Posted:</span>
                    <span className="font-bold">{userProfile.receiptsPosted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Guesses:</span>
                    <span className="font-bold">{userProfile.totalGuesses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct Guesses:</span>
                    <span className="font-bold">{userProfile.correctGuesses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy Rate:</span>
                    <span className="font-bold">
                      {userProfile.totalGuesses > 0 
                        ? ((userProfile.correctGuesses / userProfile.totalGuesses) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="font-bold mt-4">================================</div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-center mb-3">🎯 Performance</h3>
              {userProfile.totalGuesses > 0 ? (
                <>
                  {(() => {
                    const accuracy = (userProfile.correctGuesses / userProfile.totalGuesses) * 100;
                    if (accuracy >= 80) return <p className="text-center text-green-700">🏆 Elite Guesser! Amazing accuracy!</p>;
                    if (accuracy >= 60) return <p className="text-center text-green-600">🎯 Great Guesser! Keep it up!</p>;
                    if (accuracy >= 40) return <p className="text-center text-yellow-600">👍 Good progress! Getting better!</p>;
                    return <p className="text-center text-orange-600">🎮 Keep practicing! You'll improve!</p>;
                  })()}
                </>
              ) : (
                <p className="text-center text-gray-600">Make some guesses to see your accuracy!</p>
              )}
              
              <div className="mt-3 space-y-1">
                {userProfile.receiptsPosted >= 5 && (
                  <p className="text-center text-blue-600">📄 Prolific Poster!</p>
                )}
                {userProfile.totalPoints >= 1000 && (
                  <p className="text-center text-purple-600">💎 High Roller!</p>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-center mb-3">🏆 Achievements</h3>
              
              {userProfile.achievements.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.achievements.map((achievementId: string) => {
                    const achievement = getAchievementById(achievementId);
                    return achievement ? (
                      <div key={achievementId} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="font-bold">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  
                  <p className="text-center text-sm text-gray-600">
                    {userProfile.achievements.length} of 10 achievements unlocked
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  No achievements yet! Start playing to unlock them.
                </p>
              )}
            </div>

            {/* Next Goals */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-center mb-3">🎯 Next Goals:</h3>
              
              <div className="text-sm space-y-1">
                {userProfile.receiptsPosted === 0 && (
                  <p className="text-center">📄 Post your first grocery receipt</p>
                )}
                {userProfile.totalGuesses === 0 && (
                  <p className="text-center">🎯 Make your first guess</p>
                )}
                {userProfile.correctGuesses === 0 && userProfile.totalGuesses > 0 && (
                  <p className="text-center">🎯 Get your first perfect guess</p>
                )}
                {userProfile.totalPoints < 1000 && (
                  <p className="text-center">💎 Reach 1,000 total points</p>
                )}
                {userProfile.totalGuesses < 25 && userProfile.totalGuesses > 0 && (
                  <p className="text-center">🤖 Make 25 total guesses</p>
                )}
                {userProfile.receiptsPosted < 5 && userProfile.receiptsPosted > 0 && (
                  <p className="text-center">📄 Post 5 grocery receipts</p>
                )}
              </div>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
        >
          Close Stats
        </button>
      </div>
    </div>
  );
};