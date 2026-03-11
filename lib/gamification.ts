/**
 * Gamification System
 * Avatar, Coins, Streaks, Boss Battles, Achievements
 */

export type AvatarAccessory = "hat" | "pet" | "background" | "outfit";

/**
 * Avatar customization
 */
export interface Avatar {
  id: string;
  name: string;
  baseColor: string;
  accessories: {
    hat?: string;
    pet?: string;
    background?: string;
    outfit?: string;
  };
  level: number; // Avatar level (unlocked with coins)
}

/**
 * Coin system
 */
export interface CoinBalance {
  totalCoins: number;
  coinsEarned: number;
  coinsSpent: number;
  lastUpdated: string;
}

/**
 * Streak tracking
 */
export interface StreakData {
  currentStreak: number; // Days in a row
  longestStreak: number;
  lastPracticeDate: string; // ISO date
  streakStartDate: string; // ISO date
}

/**
 * Boss battle
 */
export interface BossBattle {
  id: string;
  weekNumber: number;
  difficulty: "easy" | "normal" | "hard";
  questionsCount: number;
  passingScore: number; // Percentage
  reward: number; // Coins
  completed: boolean;
  completedDate?: string;
  score?: number;
}

/**
 * Achievement/Badge
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "streak" | "accuracy" | "speed" | "milestone" | "boss";
  unlockedDate?: string;
  progress?: number; // For progressive achievements
}

/**
 * Calculate coins earned from practice session
 */
export function calculateCoinsEarned(
  correctAnswers: number,
  totalQuestions: number,
  speedScore: number
): number {
  const accuracyBonus = Math.round((correctAnswers / totalQuestions) * 10);
  const speedBonus = Math.round(speedScore / 10);
  return accuracyBonus + speedBonus;
}

/**
 * Update streak data
 */
export function updateStreakData(
  currentStreak: StreakData,
  practiced: boolean
): StreakData {
  const today = new Date().toISOString().split("T")[0];
  const lastDate = currentStreak.lastPracticeDate.split("T")[0];

  if (!practiced) {
    return currentStreak;
  }

  // Check if practiced today already
  if (lastDate === today) {
    return currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Continue streak if practiced yesterday
  if (lastDate === yesterdayStr) {
    const newStreak = currentStreak.currentStreak + 1;
    return {
      ...currentStreak,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentStreak.longestStreak),
      lastPracticeDate: new Date().toISOString(),
    };
  }

  // Reset streak if gap
  return {
    ...currentStreak,
    currentStreak: 1,
    lastPracticeDate: new Date().toISOString(),
    streakStartDate: new Date().toISOString(),
  };
}

/**
 * Get streak flame emoji based on streak count
 */
export function getStreakFlame(streakCount: number): string {
  if (streakCount === 0) return "❄️";
  if (streakCount < 3) return "🔥";
  if (streakCount < 7) return "🔥🔥";
  if (streakCount < 14) return "🔥🔥🔥";
  if (streakCount < 30) return "🔥🔥🔥🔥";
  return "🔥🔥🔥🔥🔥";
}

/**
 * Create boss battle for the week
 */
export function createWeeklyBossBattle(weekNumber: number): BossBattle {
  const difficulties: Array<"easy" | "normal" | "hard"> = [
    "easy",
    "normal",
    "hard",
  ];
  const difficulty = difficulties[weekNumber % 3];

  const questionsCount = difficulty === "easy" ? 15 : difficulty === "normal" ? 20 : 25;
  const passingScore = difficulty === "easy" ? 70 : difficulty === "normal" ? 80 : 90;
  const reward = difficulty === "easy" ? 20 : difficulty === "normal" ? 30 : 50;

  return {
    id: `boss-week-${weekNumber}`,
    weekNumber,
    difficulty,
    questionsCount,
    passingScore,
    reward,
    completed: false,
  };
}

/**
 * Check if boss battle is passed
 */
export function isBossBattlePassed(
  score: number,
  passingScore: number
): boolean {
  return score >= passingScore;
}

/**
 * Get boss battle reward
 */
export function getBossBattleReward(
  score: number,
  passingScore: number,
  baseReward: number
): number {
  if (score >= passingScore) {
    // Bonus for higher scores
    const bonus = Math.round((score - passingScore) / 10);
    return baseReward + bonus;
  }
  return 0;
}

/**
 * Create avatar
 */
export function createAvatar(name: string): Avatar {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: `avatar-${Date.now()}`,
    name,
    baseColor: randomColor,
    accessories: {},
    level: 1,
  };
}

/**
 * Unlock avatar accessory
 */
export function unlockAvatarAccessory(
  avatar: Avatar,
  accessoryType: AvatarAccessory,
  accessoryName: string,
  coinsCost: number,
  currentCoins: number
): { success: boolean; avatar?: Avatar; message: string } {
  if (currentCoins < coinsCost) {
    return {
      success: false,
      message: `Not enough coins! You need ${coinsCost} coins but have ${currentCoins}.`,
    };
  }

  const updatedAvatar = {
    ...avatar,
    accessories: {
      ...avatar.accessories,
      [accessoryType]: accessoryName,
    },
  };

  return {
    success: true,
    avatar: updatedAvatar,
    message: `Unlocked ${accessoryName}!`,
  };
}

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  FIRST_PRACTICE: {
    id: "first-practice",
    name: "Getting Started",
    description: "Complete your first practice session",
    icon: "🎯",
    type: "milestone" as const,
  },
  PERFECT_SESSION: {
    id: "perfect-session",
    name: "Perfect Score",
    description: "Get 100% accuracy in a practice session",
    icon: "💯",
    type: "accuracy" as const,
  },
  SPEED_DEMON: {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Achieve 90%+ speed score",
    icon: "⚡",
    type: "speed" as const,
  },
  WEEK_WARRIOR: {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Practice 7 days in a row",
    icon: "🗓️",
    type: "streak" as const,
  },
  MONTH_MASTER: {
    id: "month-master",
    name: "Month Master",
    description: "Practice 30 days in a row",
    icon: "📅",
    type: "streak" as const,
  },
  BOSS_SLAYER: {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Defeat 5 boss battles",
    icon: "👹",
    type: "boss" as const,
  },
  ACCURACY_EXPERT: {
    id: "accuracy-expert",
    name: "Accuracy Expert",
    description: "Maintain 90%+ accuracy across 10 sessions",
    icon: "🎖️",
    type: "accuracy" as const,
  },
};

/**
 * Check if achievement is unlocked
 */
export function checkAchievementUnlock(
  achievementId: string,
  stats: {
    accuracy?: number;
    speedScore?: number;
    currentStreak?: number;
    sessionsCompleted?: number;
    bossBattlesWon?: number;
  }
): boolean {
  switch (achievementId) {
    case "perfect-session":
      return stats.accuracy === 100;
    case "speed-demon":
      return (stats.speedScore || 0) >= 90;
    case "week-warrior":
      return (stats.currentStreak || 0) >= 7;
    case "month-master":
      return (stats.currentStreak || 0) >= 30;
    case "boss-slayer":
      return (stats.bossBattlesWon || 0) >= 5;
    case "accuracy-expert":
      return (stats.accuracy || 0) >= 90 && (stats.sessionsCompleted || 0) >= 10;
    default:
      return false;
  }
}

/**
 * Calculate daily target progress
 */
export function calculateDailyTargetProgress(
  questionsAnswered: number,
  dailyTarget: number
): { progress: number; status: "not-started" | "in-progress" | "completed" } {
  const progress = Math.min(100, Math.round((questionsAnswered / dailyTarget) * 100));

  let status: "not-started" | "in-progress" | "completed" = "not-started";
  if (questionsAnswered > 0 && questionsAnswered < dailyTarget) {
    status = "in-progress";
  } else if (questionsAnswered >= dailyTarget) {
    status = "completed";
  }

  return { progress, status };
}
