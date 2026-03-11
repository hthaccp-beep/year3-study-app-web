/**
 * Adaptive Difficulty Algorithm
 * Implements baseline testing, auto-leveling, and spaced repetition
 */

import { Level, Subject, Question, PracticeSession } from "./types";

export type AdaptiveMode = "baseline" | "adaptive" | "teaching";
export type ExamMode = "gl-style" | "tiffin-style";

/**
 * Baseline test configuration
 */
export const BASELINE_CONFIG = {
  questionsPerTest: 5,
  difficulty: "intermediate" as Level,
};

/**
 * Auto-leveling thresholds
 */
export const AUTO_LEVEL_THRESHOLDS = {
  moveUp: 100, // 5/5 correct
  moveDown: 60, // Less than 3/5 correct
  stay: 80, // 3-4/5 correct
};

/**
 * Spaced repetition schedule (in days)
 */
export const SPACED_REPETITION_SCHEDULE = [1, 3, 7, 30];

/**
 * Calculate next difficulty level based on performance
 */
export function calculateNextLevel(
  currentLevel: Level,
  accuracy: number
): { nextLevel: Level; mode: AdaptiveMode } {
  const levels: Level[] = ["foundation", "intermediate", "advanced", "expert"];
  const currentIndex = levels.indexOf(currentLevel);

  if (accuracy >= AUTO_LEVEL_THRESHOLDS.moveUp) {
    // Move up if not at expert
    const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
    return {
      nextLevel: levels[nextIndex],
      mode: nextIndex > currentIndex ? "adaptive" : "adaptive",
    };
  }

  if (accuracy <= AUTO_LEVEL_THRESHOLDS.moveDown) {
    // Move down to teaching mode or foundation
    const nextIndex = Math.max(currentIndex - 1, 0);
    return {
      nextLevel: levels[nextIndex],
      mode: "teaching",
    };
  }

  // Stay at current level
  return {
    nextLevel: currentLevel,
    mode: "adaptive",
  };
}

/**
 * Mistake Bank Entry
 */
export interface MistakeBankEntry {
  id: string;
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  subject: Subject;
  level: Level;
  dateWrong: string; // ISO date
  nextReviewDate: string; // ISO date for spaced repetition
  reviewCount: number; // How many times reviewed
  reviewScheduleIndex: number; // Current position in spaced repetition schedule
}

/**
 * Create a mistake bank entry
 */
export function createMistakeBankEntry(
  question: Question,
  userAnswer: string,
  subject: Subject,
  level: Level
): MistakeBankEntry {
  const today = new Date();
  const nextReview = new Date(today);
  nextReview.setDate(nextReview.getDate() + SPACED_REPETITION_SCHEDULE[0]);

  return {
    id: `mistake-${Date.now()}`,
    questionId: question.id,
    question: question.question,
    userAnswer,
    correctAnswer:
      typeof question.correctAnswer === "string"
        ? question.correctAnswer
        : question.correctAnswer[0],
    subject,
    level,
    dateWrong: today.toISOString(),
    nextReviewDate: nextReview.toISOString(),
    reviewCount: 0,
    reviewScheduleIndex: 0,
  };
}

/**
 * Calculate next review date for spaced repetition
 */
export function calculateNextReviewDate(
  reviewScheduleIndex: number
): string {
  const today = new Date();
  const nextIndex = Math.min(
    reviewScheduleIndex + 1,
    SPACED_REPETITION_SCHEDULE.length - 1
  );
  const daysToAdd = SPACED_REPETITION_SCHEDULE[nextIndex];

  const nextReview = new Date(today);
  nextReview.setDate(nextReview.getDate() + daysToAdd);

  return nextReview.toISOString();
}

/**
 * Check if a mistake is due for review
 */
export function isMistakeDueForReview(entry: MistakeBankEntry): boolean {
  const today = new Date();
  const reviewDate = new Date(entry.nextReviewDate);
  return today >= reviewDate;
}

/**
 * Get mistakes due for review
 */
export function getMistakesDueForReview(
  mistakeBank: MistakeBankEntry[]
): MistakeBankEntry[] {
  return mistakeBank.filter(isMistakeDueForReview);
}

/**
 * Update mistake entry after review
 */
export function updateMistakeAfterReview(
  entry: MistakeBankEntry,
  correct: boolean
): MistakeBankEntry {
  if (correct) {
    // Move to next review schedule
    const nextIndex = Math.min(
      entry.reviewScheduleIndex + 1,
      SPACED_REPETITION_SCHEDULE.length - 1
    );

    return {
      ...entry,
      reviewCount: entry.reviewCount + 1,
      reviewScheduleIndex: nextIndex,
      nextReviewDate: calculateNextReviewDate(nextIndex),
    };
  } else {
    // Reset to first review schedule
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + SPACED_REPETITION_SCHEDULE[0]);

    return {
      ...entry,
      reviewCount: entry.reviewCount + 1,
      reviewScheduleIndex: 0,
      nextReviewDate: nextReview.toISOString(),
    };
  }
}

/**
 * Calculate speed score based on time taken
 */
export function calculateSpeedScore(
  timeTakenSeconds: number,
  level: Level
): number {
  const TIME_LIMITS: Record<Level, number> = {
    foundation: 120,
    intermediate: 90,
    advanced: 60,
    expert: 45,
  };

  const timeLimit = TIME_LIMITS[level];
  const efficiency = Math.max(0, (timeLimit - timeTakenSeconds) / timeLimit);
  return Math.round(efficiency * 100);
}

/**
 * Check if student should enter Teaching Mode
 */
export function shouldEnterTeachingMode(accuracy: number): boolean {
  return accuracy < AUTO_LEVEL_THRESHOLDS.moveDown;
}

/**
 * Get adaptive mode based on performance
 */
export function getAdaptiveMode(accuracy: number): AdaptiveMode {
  if (shouldEnterTeachingMode(accuracy)) {
    return "teaching";
  }
  return "adaptive";
}

/**
 * Calculate daily target based on year group and term
 */
export function calculateDailyTarget(
  yearGroup: string,
  isHoliday: boolean = false
): number {
  const targets: Record<string, number> = {
    "year-3": 5,
    "year-4": 10,
    "year-5": isHoliday ? 40 : 20,
    "year-6": 20,
  };

  return targets[yearGroup] || 5;
}

/**
 * Check if daily target is met
 */
export function isDailyTargetMet(
  questionsAnswered: number,
  dailyTarget: number
): boolean {
  return questionsAnswered >= dailyTarget;
}

/**
 * Calculate progress percentage towards daily target
 */
export function calculateDailyProgress(
  questionsAnswered: number,
  dailyTarget: number
): number {
  return Math.min(100, Math.round((questionsAnswered / dailyTarget) * 100));
}
