// src/server/main.tsx - Version without JSX UI components
import { Devvit, useForm } from '@devvit/public-api';
import type { Context } from '@devvit/public-api';

// Define interfaces
interface GroceryPostData {
  id: string;
  postId: string;
  originalCurrency: string;
  originalPrices: { item: string; qty: number; price: number }[];
  convertedTotalUSD: number;
  location: string;
  posterUsername: string;
  guesses: Record<string, number>;
  createdAt: string;
  revealed: boolean;
}

interface UserProfileData {
  username: string;
  totalPoints: number;
  receiptsPosted: number;
  totalGuesses: number;
  correctGuesses: number;
  achievements: string[];
  lastPostDate?: string;
  joinedDate: string;
}

interface RateLimitData {
  lastAction: string;
  count: number;
}

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Helper functions
async function checkPostRateLimit(redis: any, username: string): Promise<boolean> {
  try {
    const rateLimitKey = `ratelimit:post:${username}`;
    const lastPostStr = await redis.get(rateLimitKey);

    if (lastPostStr) {
      const rateLimitInfo: RateLimitData = JSON.parse(lastPostStr);
      const lastPostTime = new Date(rateLimitInfo.lastAction).getTime();
      const now = Date.now();
      const timeDiff = now - lastPostTime;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDiff < fiveMinutes) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true;
  }
}

async function checkGuessRateLimit(redis: any, username: string, postId: string): Promise<boolean> {
  try {
    const rateLimitKey = `ratelimit:guess:${username}:${postId}`;
    const existingStr = await redis.get(rateLimitKey);

    if (existingStr) {
      const rateLimitInfo: RateLimitData = JSON.parse(existingStr);
      if (rateLimitInfo.count >= 3) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true;
  }
}

async function getAllUserProfiles(redis: any): Promise<UserProfileData[]> {
  const userProfiles: UserProfileData[] = [];

  try {
    const userListStr = await redis.get('users:list');
    let usernames: string[] = [];

    if (userListStr) {
      usernames = JSON.parse(userListStr);
    }

    for (const username of usernames) {
      try {
        const profileStr = await redis.get(`user:${username}`);
        if (profileStr) {
          const profile: UserProfileData = JSON.parse(profileStr);
          userProfiles.push(profile);
        }
      } catch (parseError) {
        console.error(`Failed to parse profile for user ${username}:`, parseError);
      }
    }
  } catch (error) {
    console.error('Failed to get user profiles:', error);
  }

  return userProfiles;
}

async function addUserToList(redis: any, username: string): Promise<void> {
  try {
    const userListStr = await redis.get('users:list');
    let usernames: string[] = userListStr ? JSON.parse(userListStr) : [];

    if (!usernames.includes(username)) {
      usernames.push(username);
      await redis.set('users:list', JSON.stringify(usernames));
    }
  } catch (error) {
    console.error('Failed to add user to list:', error);
  }
}

// Validation and scoring functions
function validateReceiptItems(_items: any[]): any[] {
  return [];
}

function validateCurrency(_currency: string): any[] {
  return [];
}

function calculatePoints(guess: number, actual: number): number {
  const accuracy = Math.abs(guess - actual) / actual;
  if (accuracy <= 0.01) return 100;
  if (accuracy <= 0.05) return 75;
  if (accuracy <= 0.10) return 50;
  if (accuracy <= 0.25) return 25;
  return 10;
}

function isCorrectGuess(guess: number, actual: number): boolean {
  const accuracy = Math.abs(guess - actual) / actual;
  return accuracy <= 0.01;
}

function checkAchievements(oldProfile: UserProfileData | null, newProfile: UserProfileData): any[] {
  const achievements = [];

  if (newProfile.receiptsPosted === 1 && (!oldProfile || oldProfile.receiptsPosted === 0)) {
    achievements.push({ id: 'first_haul', name: 'First Haul' });
  }

  if (newProfile.totalGuesses === 1 && (!oldProfile || oldProfile.totalGuesses === 0)) {
    achievements.push({ id: 'first_guess', name: 'First Guess' });
  }

  return achievements;
}

// Create Grocery Post Menu Item - Using simple forms
Devvit.addMenuItem({
  label: 'Create Grocery Post',
  location: 'subreddit',
  onPress: async (_, context: Context) => {
    const { ui, reddit, redis, subredditName } = context;

    const postForm = useForm(
      {
        title: 'Post Your Grocery Haul',
        description: 'Share your grocery receipt for others to guess the total cost',
        acceptLabel: 'Create Post',
        fields: [
          {
            type: 'string',
            name: 'items',
            label: 'Items (JSON format)',
            required: true,
            helpText: 'Enter items as JSON: [{"item":"Milk","qty":1,"price":3.50}]'
          },
          {
            type: 'select',
            name: 'currency',
            label: 'Currency',
            options: [
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'GBP', value: 'GBP' },
              { label: 'CAD', value: 'CAD' },
              { label: 'AUD', value: 'AUD' }
            ],
            required: true,
            multiSelect: false,
          },
          {
            type: 'string',
            name: 'location',
            label: 'Location (City, Country)',
            required: true
          }
        ],
      },
      async (values) => {
        try {
          const currentUser = await reddit.getCurrentUser();
          const username = currentUser?.username;

          if (!username) {
            ui.showToast('You must be logged in to post.');
            return;
          }

          // Parse items
          let items: { item: string; qty: number; price: number }[];
          try {
            items = JSON.parse(values.items);
          } catch {
            ui.showToast('Invalid items format. Please use valid JSON.');
            return;
          }

          // Rate limiting check
          const canPost = await checkPostRateLimit(redis, username);
          if (!canPost) {
            ui.showToast('Please wait 5 minutes before posting again.');
            return;
          }

          // Handle currency (could be string or array)
          const currency = (Array.isArray(values.currency) ? values.currency[0] : values.currency) ?? '';

          if (!currency) {
            ui.showToast('Please select a currency.');
            return;
          }


          // Validation
          const itemErrors = validateReceiptItems(items);
          const currencyErrors = validateCurrency(currency);

          if (itemErrors.length > 0 || currencyErrors.length > 0) {
            ui.showToast('Validation failed. Please check your input.');
            return;
          }

          // Calculate converted total
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0);
          const convertedTotal = subtotal;

          // Create post with simple text preview (no JSX components)
          const post = await reddit.submitPost({
            title: `🛒 Grocery Guessr Challenge - ${values.location}`,
            subredditName: subredditName!,
            // Use simple text instead of JSX
            text: `🛒 Grocery Guessr Challenge\n\nLocation: ${values.location}\nItems: ${items.length}\nCurrency: ${currency}\n\nCan you guess the total cost? Click to play!`,
  // customPostType: 'Grocery Guessr', 
          });

          const groceryPost: GroceryPostData = {
            id: `post:${post.id}`,
            postId: post.id,
            originalCurrency: currency,
            originalPrices: items,
            convertedTotalUSD: convertedTotal,
            location: values.location,
            posterUsername: username,
            guesses: {},
            createdAt: new Date().toISOString(),
            revealed: false,
          };

          // Save to Redis
          await redis.set(`post:${post.id}`, JSON.stringify(groceryPost));

          // Update rate limit
          const rateLimitInfo: RateLimitData = {
            lastAction: new Date().toISOString(),
            count: 1,
          };
          await redis.set(`ratelimit:post:${username}`, JSON.stringify(rateLimitInfo));

          // Update user profile
          await addUserToList(redis, username);
          const userProfileKey = `user:${username}`;
          const existingProfileStr = await redis.get(userProfileKey);
          const oldProfile: UserProfileData | null = existingProfileStr ? JSON.parse(existingProfileStr) : null;

          let userProfile: UserProfileData;
          if (oldProfile) {
            userProfile = { ...oldProfile };
          } else {
            userProfile = {
              username: username,
              totalPoints: 0,
              receiptsPosted: 0,
              totalGuesses: 0,
              correctGuesses: 0,
              achievements: [],
              joinedDate: new Date().toISOString(),
            };
          }

          userProfile.receiptsPosted++;
          userProfile.totalPoints += 50;
          userProfile.lastPostDate = new Date().toISOString();

          // Check for new achievements
          const newAchievements = checkAchievements(oldProfile, userProfile);
          if (newAchievements.length > 0) {
            newAchievements.forEach(achievement => {
              if (!userProfile.achievements.includes(achievement.id)) {
                userProfile.achievements.push(achievement.id);
              }
            });

            ui.showToast({
              text: `🎉 Achievement unlocked: ${newAchievements[0].name}!`,
              appearance: 'success'
            });
          }

          await redis.set(userProfileKey, JSON.stringify(userProfile));

          ui.showToast({
            text: 'Grocery haul posted successfully! 🎉',
            appearance: 'success'
          });

        } catch (error) {
          console.error('Failed to create post:', error);
          ui.showToast('Failed to create post. Please try again.');
        }
      }
    );

    ui.showForm(postForm);
  },
});

// Simplified custom post type without JSX UI
Devvit.addCustomPostType({
  name: 'Grocery Guessr',
  description: 'A game where users share grocery receipts and guess totals for points',
  height: 'regular', // Use regular height to avoid complex UI
  render: (context: Context) => {
    // Return simple text-based interface
    return context.reddit.getCurrentUser().then(async (currentUser) => {
      const username = currentUser?.username;
      const redis = context.redis;
      const postStr = await redis.get(`post:${context.postId}`);

      if (!postStr) {
        return "🛒 Welcome to Grocery Guessr! This post doesn't have receipt data yet.";
      }

      const groceryPost: GroceryPostData = JSON.parse(postStr);
      const hasGuessed = username ? groceryPost.guesses[username] !== undefined : false;
      const isOwner = groceryPost.posterUsername === username;
      const guessCount = Object.keys(groceryPost.guesses).length;

      // Generate receipt display
      let receiptText = `🧾 GROCERY RECEIPT\n`;
      receiptText += `Location: ${groceryPost.location}\n`;
      receiptText += `Posted by u/${groceryPost.posterUsername}\n`;
      receiptText += `${guessCount} players have guessed\n\n`;
      receiptText += `================================\n`;
      receiptText += `GROCERY STORE RECEIPT\n`;
      receiptText += `${groceryPost.location}\n`;
      receiptText += `================================\n\n`;

      groceryPost.originalPrices.forEach((item) => {
        receiptText += `${item.qty}x ${item.item.padEnd(20)} ??.??\n`;
      });

      receiptText += `\n--------------------------------\n`;
      receiptText += `TOTAL (${groceryPost.originalCurrency}):          ??.??\n`;
      receiptText += `================================\n\n`;

      if (hasGuessed && username && groceryPost.guesses[username] !== undefined) {
        receiptText += `Your guess: $${groceryPost.guesses[username].toFixed(2)}\n`;
        receiptText += `Actual total: $${groceryPost.convertedTotalUSD.toFixed(2)}\n`;
        receiptText += `Thanks for playing!`;
      } else if (isOwner) {
        receiptText += `This is your receipt! Others can guess the total.\n`;
        receiptText += `Actual total: $${groceryPost.convertedTotalUSD.toFixed(2)}`;
      } else {
        receiptText += `Can you guess the total cost?\n`;
        receiptText += `Use the menu actions to make your guess!`;
      }

      return receiptText;
    }).catch(() => {
      return "Error loading grocery receipt data.";
    });
  },
});

// Enhanced menu action for making guesses
Devvit.addMenuItem({
  label: '🎯 Make Guess',
  location: 'post',
  onPress: async (_, context: Context) => {
    const { ui, redis, reddit } = context;

    const guessForm = useForm(
      {
        title: 'Guess the Total Cost',
        description: 'Enter your guess in USD. Accurate guesses earn more points!',
        acceptLabel: 'Submit Guess',
        fields: [
          {
            type: 'string',
            name: 'guess',
            label: 'Your guess (USD)',
            placeholder: '42.50',
            required: true,
          },
        ],
      },
      async (values) => {
        try {
          const postStr = await redis.get(`post:${context.postId}`);
          if (!postStr) {
            ui.showToast('Could not find grocery post data.');
            return;
          }

          const groceryPost: GroceryPostData = JSON.parse(postStr);
          const guessValue = parseFloat(values.guess);

          if (isNaN(guessValue) || guessValue <= 0) {
            ui.showToast('Please enter a valid positive number.');
            return;
          }

          const currentUser = await reddit.getCurrentUser();
          const username = currentUser?.username;

          if (!username) {
            ui.showToast('You must be logged in to guess.');
            return;
          }

          // Check if user already guessed
          if (groceryPost.guesses[username] !== undefined) {
            ui.showToast('You have already made a guess on this post!');
            return;
          }

          // Check if user owns the post
          if (groceryPost.posterUsername === username) {
            ui.showToast('You cannot guess on your own post!');
            return;
          }

          // Rate limiting
          const canGuess = await checkGuessRateLimit(redis, username, groceryPost.postId);
          if (!canGuess) {
            ui.showToast('You can only make 3 guesses per post.');
            return;
          }

          const actualTotal = groceryPost.convertedTotalUSD;

          // Update post with guess
          const updatedPost: GroceryPostData = {
            ...groceryPost,
            guesses: { ...groceryPost.guesses, [username]: guessValue }
          };
          await redis.set(`post:${groceryPost.postId}`, JSON.stringify(updatedPost));

          // Update rate limit
          const rateLimitKey = `ratelimit:guess:${username}:${groceryPost.postId}`;
          const existingStr = await redis.get(rateLimitKey);
          let rateLimitInfo: RateLimitData;

          if (existingStr) {
            rateLimitInfo = JSON.parse(existingStr);
            rateLimitInfo.count++;
            rateLimitInfo.lastAction = new Date().toISOString();
          } else {
            rateLimitInfo = {
              lastAction: new Date().toISOString(),
              count: 1,
            };
          }
          await redis.set(rateLimitKey, JSON.stringify(rateLimitInfo));

          // Update user profile
          await addUserToList(redis, username);
          const userProfileKey = `user:${username}`;
          const existingProfileStr = await redis.get(userProfileKey);
          const oldProfile: UserProfileData | null = existingProfileStr ? JSON.parse(existingProfileStr) : null;

          let userProfile: UserProfileData;
          if (oldProfile) {
            userProfile = { ...oldProfile };
          } else {
            userProfile = {
              username: username,
              totalPoints: 0,
              receiptsPosted: 0,
              totalGuesses: 0,
              correctGuesses: 0,
              achievements: [],
              joinedDate: new Date().toISOString(),
            };
          }

          userProfile.totalGuesses++;
          const points = calculatePoints(guessValue, actualTotal);
          userProfile.totalPoints += points;

          const isCorrect = isCorrectGuess(guessValue, actualTotal);
          let feedbackMessage = '';

          if (isCorrect) {
            userProfile.correctGuesses++;
            feedbackMessage = 'Correct! 🎉 Amazing guess!';
          } else {
            const direction = guessValue > actualTotal ? 'Too High!' : 'Too Low!';
            const percentageOff = Math.abs((guessValue - actualTotal) / actualTotal) * 100;
            feedbackMessage = `${direction} You were ${percentageOff.toFixed(1)}% off. Actual: $${actualTotal.toFixed(2)}`;
          }

          // Check for new achievements
          const newAchievements = checkAchievements(oldProfile, userProfile);
          if (newAchievements.length > 0) {
            newAchievements.forEach(achievement => {
              if (!userProfile.achievements.includes(achievement.id)) {
                userProfile.achievements.push(achievement.id);
              }
            });

            ui.showToast({
              text: `🎉 Achievement unlocked: ${newAchievements[0].name}!`,
              appearance: 'success'
            });
          }

          await redis.set(userProfileKey, JSON.stringify(userProfile));

          ui.showToast({
            text: `${feedbackMessage}\nYou earned ${points} points!`,
            appearance: isCorrect ? 'success' : 'neutral'
          });

        } catch (error) {
          console.error('Failed to submit guess:', error);
          ui.showToast('Failed to submit guess. Please try again.');
        }
      }
    );

    ui.showForm(guessForm);
  },
});

// Menu actions
Devvit.addMenuItem({
  label: '🏆 View Leaderboard',
  location: 'post',
  onPress: async (_, context: Context) => {
    try {
      const userProfiles = await getAllUserProfiles(context.redis);
      const topUsers = userProfiles
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);

      if (topUsers.length === 0) {
        context.ui.showToast('No players yet! Be the first to post a haul.');
        return;
      }

      const leaderboardText = topUsers
        .map((user, index) => `${index + 1}. ${user.username}: ${user.totalPoints} pts`)
        .join('\n');

      context.ui.showToast({
        text: `🏆 TOP PLAYERS:\n${leaderboardText}`,
        appearance: 'success'
      });
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      context.ui.showToast('Failed to load leaderboard.');
    }
  },
});

Devvit.addMenuItem({
  label: '📊 My Stats',
  location: 'post',
  onPress: async (_, context: Context) => {
    try {
      const currentUser = await context.reddit.getCurrentUser();
      const username = currentUser?.username;

      if (!username) {
        context.ui.showToast('You must be logged in to view stats.');
        return;
      }

      const profileStr = await context.redis.get(`user:${username}`);

      if (!profileStr) {
        context.ui.showToast('No stats yet! Start playing to track your progress.');
        return;
      }

      const profile: UserProfileData = JSON.parse(profileStr);
      const accuracy = profile.totalGuesses > 0
        ? ((profile.correctGuesses / profile.totalGuesses) * 100).toFixed(1)
        : '0';

      context.ui.showToast({
        text: `📊 YOUR STATS:\nPoints: ${profile.totalPoints}\nPosts: ${profile.receiptsPosted}\nGuesses: ${profile.totalGuesses}\nAccuracy: ${accuracy}%`,
        appearance: 'success'
      });
    } catch (error) {
      console.error('Failed to get stats:', error);
      context.ui.showToast('Failed to load your stats.');
    }
  },
});

Devvit.addMenuItem({
  label: '❓ How to Play',
  location: 'post',
  onPress: async (_, context: Context) => {
    context.ui.showToast({
      text: '🛒 Post grocery receipts using subreddit menu\n🎯 Guess totals on others\' posts\n📊 Earn points for accuracy\n🏆 Compete on leaderboards!',
      appearance: 'success',
    });
  },
});

export default Devvit;