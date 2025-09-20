import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../shared/types.js';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the exact shape of leaderboard data
interface LeaderboardData {
  topPoints: {
    username: string;
    totalPoints: number;
    accuracy: number;
    receiptsPosted: number;
  }[];
  topAccuracy: {
    username: string;
    totalPoints: number;
    accuracy: number;
    receiptsPosted: number;
  }[];
  totalUsers: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async (): Promise<void> => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');

        if (response.ok) {
          const data: LeaderboardData = await response.json();
          setLeaderboardData(data);
          setError(null);
        } else {
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard');
        setLeaderboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-6">🏆 LEADERBOARD</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg">Loading leaderboard...</p>
            <p className="text-sm text-gray-600">Fetching the top players</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">{error}</p>
            <p className="text-sm text-gray-600">Please try again later</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : !leaderboardData ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No leaderboard data available</p>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Compete with {leaderboardData.totalUsers} grocery guessers!
            </p>

            {/* Thermal Printer Style Leaderboard */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Points Column */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="font-mono text-sm text-center mb-4">
                  <div className="font-bold">================================</div>
                  <div className="font-bold">🎯 TOP POINTS 🎯</div>
                  <div className="font-bold">================================</div>
                </div>

                <div className="space-y-2">
                  {leaderboardData.topPoints.length > 0 ? (
                    leaderboardData.topPoints.map((user, index) => (
                      <div key={`points-${user.username}-${index}`} className="flex justify-between font-mono text-sm">
                        <span>
                          #{index + 1} {user.username.length > 12 ? user.username.substring(0, 12) + '...' : user.username}
                        </span>
                        <span className="font-bold">{user.totalPoints}pts</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center font-mono text-sm text-gray-600">
                      No players yet!
                    </p>
                  )}
                </div>

                <div className="font-mono text-sm text-center mt-4">
                  <div className="font-bold">================================</div>
                </div>
              </div>

              {/* Top Accuracy Column */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="font-mono text-sm text-center mb-4">
                  <div className="font-bold">================================</div>
                  <div className="font-bold">🎯 ACCURACY ACES 🎯</div>
                  <div className="text-xs text-gray-600">(Min. 10 guesses)</div>
                  <div className="font-bold">================================</div>
                </div>

                <div className="space-y-2">
                  {leaderboardData.topAccuracy.length > 0 ? (
                    leaderboardData.topAccuracy.map((user, index) => (
                      <div key={`accuracy-${user.username}-${index}`} className="flex justify-between font-mono text-sm">
                        <span>
                          #{index + 1} {user.username.length > 12 ? user.username.substring(0, 12) + '...' : user.username}
                        </span>
                        <span className="font-bold">{user.accuracy.toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center font-mono text-sm text-gray-600">
                      Need more guessers!
                    </p>
                  )}
                </div>

                <div className="font-mono text-sm text-center mt-4">
                  <div className="font-bold">================================</div>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-center mb-3">📊 Community Stats</h3>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Players</p>
                  <p className="text-xl font-bold">{leaderboardData.totalUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Score</p>
                  <p className="text-xl font-bold">
                    {leaderboardData.topPoints.length > 0
                      ? `${leaderboardData.topPoints[0]?.totalPoints ?? 0} pts`
                      : '0 pts'}
                  </p>

                  <div>
                    <p className="text-sm text-gray-600">Best Accuracy</p>
                    <p className="text-xl font-bold">
                      {leaderboardData.topAccuracy.length > 0
                        ? `${leaderboardData.topAccuracy[0]?.accuracy?.toFixed(1) ?? '0'}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-center mb-2">🎮 How to Climb the Leaderboard:</h3>
              <div className="text-sm text-center space-y-1">
                <p>• Post receipts: 50+ points</p>
                <p>• Make accurate guesses: up to 100 points</p>
                <p>• Stay active: unlock achievements!</p>
              </div>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
        >
          Close Leaderboard
        </button>
      </div>
    </div>
  );
};