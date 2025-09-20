// types/index.ts

export interface GroceryPost {
  id: string;
  postId: string;
  originalCurrency: string;
  originalPrices: { item: string; qty: number; price: number }[];
  convertedTotalUSD: number;
  location: string;
  posterUsername: string;
  guesses: { [username: string]: number };
  createdAt: string;
  revealed: boolean;
}

export interface UserProfile {
  username: string;
  totalPoints: number;
  receiptsPosted: number;
  totalGuesses: number;
  correctGuesses: number;
  achievements: string[];
  lastPostDate?: string;
  joinedDate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile) => boolean;
}

export interface LeaderboardEntry {
  username: string;
  totalPoints: number;
  accuracy: number;
  receiptsPosted: number;
}

export interface LeaderboardData {
  topPoints: LeaderboardEntry[];
  topAccuracy: LeaderboardEntry[];
}

export interface RateLimitInfo {
  lastAction: string;
  count: number;
}

export interface ValidationError {
  field: string;
  message: string;
}