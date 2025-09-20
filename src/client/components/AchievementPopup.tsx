import React from 'react';
import { Achievement } from '../../shared/types.js';

interface AchievementPopupProps {
  achievements: Achievement[];
  isVisible: boolean;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievements,
  isVisible,
  onClose,
}) => {
  if (!isVisible || achievements.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border-4 border-yellow-400 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6">
          🎉 Achievement Unlocked! 🎉
        </h2>
        
        <div className="space-y-4 mb-6">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center"
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors"
        >
          Awesome! 🎯
        </button>
      </div>
    </div>
  );
};