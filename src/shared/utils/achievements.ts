//shared/utils/achievements.ts
import { Achievement, UserProfile } from '../types.js';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_haul',
    name: 'First Haul',
    description: 'Post your first grocery receipt',
    icon: '🛒',
    condition: (profile: UserProfile) => profile.receiptsPosted >= 1
  },
  {
    id: 'first_guess',
    name: 'First Guess',
    description: 'Make your first guess',
    icon: '🎯',
    condition: (profile: UserProfile) => profile.totalGuesses >= 1
  },
  {
    id: 'perfect_guesser',
    name: 'Perfect Guesser',
    description: 'Get your first guess within 1%',
    icon: '🎯',
    condition: (profile: UserProfile) => profile.correctGuesses >= 1
  },
  {
    id: 'serial_poster',
    name: 'Serial Poster',
    description: 'Post 5 grocery receipts',
    icon: '📄',
    condition: (profile: UserProfile) => profile.receiptsPosted >= 5
  },
  {
    id: 'guess_machine',
    name: 'Guess Machine',
    description: 'Make 25 guesses',
    icon: '🤖',
    condition: (profile: UserProfile) => profile.totalGuesses >= 25
  },
  {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: 'Get 10 correct guesses (within 1%)',
    icon: '🎯',
    condition: (profile: UserProfile) => profile.correctGuesses >= 10
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Earn 1000 total points',
    icon: '💎',
    condition: (profile: UserProfile) => profile.totalPoints >= 1000
  },
  {
    id: 'accuracy_ace',
    name: 'Accuracy Ace',
    description: 'Maintain 80%+ accuracy with 20+ guesses',
    icon: '🏆',
    condition: (profile: UserProfile) => {
      if (profile.totalGuesses < 20) return false;
      const accuracy = (profile.correctGuesses / profile.totalGuesses) * 100;
      return accuracy >= 80;
    }
  },
  {
    id: 'grocery_guru',
    name: 'Grocery Guru',
    description: 'Post 10 receipts and earn 2000 points',
    icon: '🧠',
    condition: (profile: UserProfile) => 
      profile.receiptsPosted >= 10 && profile.totalPoints >= 2000
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Make 100 guesses',
    icon: '👑',
    condition: (profile: UserProfile) => profile.totalGuesses >= 100
  }
];

export const checkAchievements = (
  oldProfile: UserProfile | null, 
  newProfile: UserProfile
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const oldAchievementIds = oldProfile?.achievements || [];

  for (const achievement of ACHIEVEMENTS) {
    if (!oldAchievementIds.includes(achievement.id) && 
        achievement.condition(newProfile)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};