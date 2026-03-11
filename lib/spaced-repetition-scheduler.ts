/**
 * Spaced Repetition Scheduler
 * Implements scientifically-proven spaced repetition intervals
 * Tracks question performance and schedules optimal review timing
 */

import { Question, Level, Subject, YearGroup } from "./types";

/**
 * Question performance record
 */
export interface QuestionPerformance {
  questionId: string;
  subject: Subject;
  level: Level;
  yearGroup: YearGroup;
  attempts: number;
  correctAttempts: number;
  accuracy: number; // 0-100
  lastAttemptDate: string;
  nextReviewDate: string;
  reviewCount: number;
  mastered: boolean; // accuracy >= 85% and reviewed 3+ times
  difficulty: "easy" | "medium" | "hard"; // Based on accuracy
}

/**
 * Spaced repetition intervals (in days)
 * Based on Ebbinghaus forgetting curve
 */
export const SPACED_INTERVALS = {
  first: 1, // 1 day
  second: 3, // 3 days
  third: 7, // 1 week
  fourth: 30, // 1 month
  mastery: 90, // 3 months (mastered, minimal review)
};

/**
 * Calculate next review date based on performance
 */
export function calculateNextReviewDate(
  performance: QuestionPerformance,
  isCorrect: boolean
): string {
  const today = new Date();
  let daysUntilReview = 1;

  if (isCorrect) {
    // Correct answer: increase interval
    switch (performance.reviewCount) {
      case 0:
        daysUntilReview = SPACED_INTERVALS.first; // 1 day
        break;
      case 1:
        daysUntilReview = SPACED_INTERVALS.second; // 3 days
        break;
      case 2:
        daysUntilReview = SPACED_INTERVALS.third; // 7 days
        break;
      case 3:
        daysUntilReview = SPACED_INTERVALS.fourth; // 30 days
        break;
      default:
        daysUntilReview = SPACED_INTERVALS.mastery; // 90 days
    }
  } else {
    // Wrong answer: reset to 1 day
    daysUntilReview = SPACED_INTERVALS.first;
  }

  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + daysUntilReview);

  return nextDate.toISOString().split("T")[0];
}

/**
 * Update question performance after attempt
 */
export function updateQuestionPerformance(
  performance: QuestionPerformance,
  isCorrect: boolean
): QuestionPerformance {
  const updated = { ...performance };

  // Update attempt counts
  updated.attempts += 1;
  if (isCorrect) {
    updated.correctAttempts += 1;
  }

  // Calculate new accuracy
  updated.accuracy = Math.round(
    (updated.correctAttempts / updated.attempts) * 100
  );

  // Update review count
  if (isCorrect) {
    updated.reviewCount += 1;
  } else {
    // Reset review count on wrong answer
    updated.reviewCount = 0;
  }

  // Update dates
  updated.lastAttemptDate = new Date().toISOString().split("T")[0];
  updated.nextReviewDate = calculateNextReviewDate(updated, isCorrect);

  // Determine difficulty
  if (updated.accuracy < 60) {
    updated.difficulty = "hard";
  } else if (updated.accuracy > 85) {
    updated.difficulty = "easy";
  } else {
    updated.difficulty = "medium";
  }

  // Check if mastered (85%+ accuracy and reviewed 3+ times)
  updated.mastered =
    updated.accuracy >= 85 && updated.reviewCount >= 3;

  return updated;
}

/**
 * Get questions due for review
 */
export function getQuestionsForReview(
  performances: QuestionPerformance[]
): QuestionPerformance[] {
  const today = new Date().toISOString().split("T")[0];

  return performances.filter((p) => {
    // Due if next review date is today or earlier
    return p.nextReviewDate <= today && !p.mastered;
  });
}

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(
  performances: QuestionPerformance[],
  difficulty: "easy" | "medium" | "hard"
): QuestionPerformance[] {
  return performances.filter((p) => p.difficulty === difficulty);
}

/**
 * Calculate session composition based on year group
 */
export interface SessionComposition {
  newQuestions: number;
  reviewQuestions: number;
  totalQuestions: number;
}

export function getSessionComposition(
  yearGroup: YearGroup,
  totalQuestions: number = 10
): SessionComposition {
  let newPercentage = 0.6; // Default 60% new
  let reviewPercentage = 0.4; // Default 40% review

  // Adjust based on year group
  switch (yearGroup) {
    case "year-3":
    case "year-4":
      newPercentage = 0.7; // 70% new, 30% review (build foundation)
      reviewPercentage = 0.3;
      break;
    case "year-5":
      newPercentage = 0.6; // 60% new, 40% review (balanced)
      reviewPercentage = 0.4;
      break;
    case "year-6":
      newPercentage = 0.5; // 50% new, 50% review (intensive prep)
      reviewPercentage = 0.5;
      break;
  }

  return {
    newQuestions: Math.ceil(totalQuestions * newPercentage),
    reviewQuestions: Math.floor(totalQuestions * reviewPercentage),
    totalQuestions,
  };
}

/**
 * Select questions for a practice session
 * Implements spaced repetition with adaptive randomization
 */
export function selectSessionQuestions(
  allQuestions: Question[],
  performances: Map<string, QuestionPerformance>,
  yearGroup: YearGroup,
  subject: Subject,
  level: Level,
  sessionSize: number = 10
): Question[] {
  const composition = getSessionComposition(yearGroup, sessionSize);

  // Filter questions by subject and level
  const subjectLevelQuestions = allQuestions.filter(
    (q) => q.subject === subject && q.level === level
  );

  // Separate new and review questions
  const newQuestions: Question[] = [];
  const reviewQuestions: Question[] = [];

  for (const question of subjectLevelQuestions) {
    const performance = performances.get(question.id);

    if (!performance || performance.attempts === 0) {
      // Never attempted = new question
      newQuestions.push(question);
    } else if (
      !performance.mastered &&
      performance.nextReviewDate <= new Date().toISOString().split("T")[0]
    ) {
      // Due for review
      reviewQuestions.push(question);
    }
  }

  // Shuffle arrays
  const shuffled = (arr: Question[]) => arr.sort(() => Math.random() - 0.5);

  // Select required number of new and review questions
  const selectedNew = shuffled(newQuestions).slice(
    0,
    composition.newQuestions
  );
  const selectedReview = shuffled(reviewQuestions).slice(
    0,
    composition.reviewQuestions
  );

  // Combine and shuffle together
  const selected = [...selectedNew, ...selectedReview];
  return shuffled(selected);
}

/**
 * Calculate mastery percentage for a subject
 */
export function calculateMasteryPercentage(
  performances: QuestionPerformance[],
  subject: Subject
): number {
  const subjectPerformances = performances.filter(
    (p) => p.subject === subject
  );

  if (subjectPerformances.length === 0) return 0;

  const masteredCount = subjectPerformances.filter(
    (p) => p.mastered
  ).length;

  return Math.round((masteredCount / subjectPerformances.length) * 100);
}

/**
 * Get performance summary for a subject
 */
export interface PerformanceSummary {
  subject: Subject;
  totalQuestions: number;
  masteredQuestions: number;
  masteryPercentage: number;
  averageAccuracy: number;
  dueForReview: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
}

export function getPerformanceSummary(
  performances: QuestionPerformance[],
  subject: Subject
): PerformanceSummary {
  const subjectPerformances = performances.filter(
    (p) => p.subject === subject
  );

  const masteredCount = subjectPerformances.filter(
    (p) => p.mastered
  ).length;
  const dueCount = getQuestionsForReview(subjectPerformances).length;
  const easyCount = getQuestionsByDifficulty(
    subjectPerformances,
    "easy"
  ).length;
  const mediumCount = getQuestionsByDifficulty(
    subjectPerformances,
    "medium"
  ).length;
  const hardCount = getQuestionsByDifficulty(
    subjectPerformances,
    "hard"
  ).length;

  const totalAccuracy =
    subjectPerformances.reduce((sum, p) => sum + p.accuracy, 0) /
    (subjectPerformances.length || 1);

  return {
    subject,
    totalQuestions: subjectPerformances.length,
    masteredQuestions: masteredCount,
    masteryPercentage: Math.round(
      (masteredCount / (subjectPerformances.length || 1)) * 100
    ),
    averageAccuracy: Math.round(totalAccuracy),
    dueForReview: dueCount,
    easyQuestions: easyCount,
    mediumQuestions: mediumCount,
    hardQuestions: hardCount,
  };
}

/**
 * Initialize performance record for a question
 */
export function initializePerformance(
  question: Question
): QuestionPerformance {
  return {
    questionId: question.id,
    subject: question.subject,
    level: question.level,
    yearGroup: question.yearGroup,
    attempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    lastAttemptDate: "",
    nextReviewDate: new Date().toISOString().split("T")[0],
    reviewCount: 0,
    mastered: false,
    difficulty: "medium",
  };
}
