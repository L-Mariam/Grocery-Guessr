// utils/scoring.ts

export const calculatePoints = (guess: number, actual: number): number => {
  const percentageOff = Math.abs((guess - actual) / actual) * 100;
  
  if (percentageOff <= 1) return 100; // Perfect guess
  if (percentageOff <= 3) return 75;  // Excellent
  if (percentageOff <= 5) return 50;  // Good
  if (percentageOff <= 10) return 25; // Fair
  if (percentageOff <= 20) return 10; // Close
  
  return 5; // Participation points
};

export const calculatePosterPoints = (
  numberOfGuesses: number,
  averageAccuracy: number
): number => {
  // Base points for posting
  let points = 50;
  
  // Bonus for engagement (more guesses)
  if (numberOfGuesses >= 5) points += 25;
  if (numberOfGuesses >= 10) points += 25;
  if (numberOfGuesses >= 20) points += 50;
  
  // Bonus for creating challenging posts (lower average accuracy means harder to guess)
  if (averageAccuracy < 50) points += 30; // Very challenging
  else if (averageAccuracy < 70) points += 20; // Challenging
  else if (averageAccuracy < 85) points += 10; // Moderately challenging
  
  return points;
};

export const isCorrectGuess = (guess: number, actual: number): boolean => {
  const percentageOff = Math.abs((guess - actual) / actual) * 100;
  return percentageOff <= 1;
};

export const getAccuracyFeedback = (guess: number, actual: number): string => {
  const percentageOff = Math.abs((guess - actual) / actual) * 100;
  const direction = guess > actual ? 'Too High!' : 'Too Low!';
  
  if (percentageOff <= 1) return 'Correct! 🎉 Amazing guess!';
  if (percentageOff <= 3) return `Wrong! 📉 ${direction} But very close!`;
  if (percentageOff <= 5) return `Wrong! 📉 ${direction} Close guess!`;
  if (percentageOff <= 10) return `Wrong! 📉 ${direction} Not bad!`;
  if (percentageOff <= 20) return `Wrong! 📉 ${direction} Getting warmer...`;
  
  return `Wrong! 📉 ${direction} Way off!`;
};