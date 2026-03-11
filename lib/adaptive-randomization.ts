/**
 * Adaptive Randomization Engine
 * Selects questions based on performance, difficulty, and learning science
 */

import { Question, Subject, Level, YearGroup } from "./types";
import { QuestionPerformance } from "./spaced-repetition-scheduler";

/**
 * Question selection criteria
 */
export interface SelectionCriteria {
  subject: Subject;
  level: Level;
  yearGroup: YearGroup;
  sessionSize: number;
  newPercentage: number; // 0-1
  reviewPercentage: number; // 0-1
  mixDifficulty: boolean; // Mix easy/medium/hard
  mixSchools: boolean; // Mix QE/Tiffin/Sutton
  avoidRecent: boolean; // Don't repeat same question soon
}

/**
 * Weighted random selection
 */
function weightedRandomSelect<T>(
  items: T[],
  weights: number[],
  count: number
): T[] {
  if (items.length === 0) return [];

  const selected: T[] = [];
  const remaining = [...items];
  const remainingWeights = [...weights];

  for (let i = 0; i < Math.min(count, items.length); i++) {
    // Calculate total weight
    const totalWeight = remainingWeights.reduce((a, b) => a + b, 0);

    // Random selection based on weights
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < remainingWeights.length; j++) {
      random -= remainingWeights[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    // Add to selected and remove from remaining
    selected.push(remaining[selectedIndex]);
    remaining.splice(selectedIndex, 1);
    remainingWeights.splice(selectedIndex, 1);
  }

  return selected;
}

/**
 * Shuffle array randomly
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get weight for a question based on performance
 * Higher weight = more likely to be selected
 */
function getQuestionWeight(
  question: Question,
  performance: QuestionPerformance | undefined,
  isReview: boolean
): number {
  if (!performance || performance.attempts === 0) {
    // New question: equal weight
    return 1.0;
  }

  if (isReview) {
    // Review questions: weight based on accuracy
    // Lower accuracy = higher weight (needs more practice)
    if (performance.accuracy < 60) {
      return 2.0; // Hard - high priority
    } else if (performance.accuracy < 75) {
      return 1.5; // Medium - medium priority
    } else {
      return 1.0; // Easy - low priority
    }
  }

  return 1.0;
}

/**
 * Select questions for a session with adaptive randomization
 */
export function selectAdaptiveQuestions(
  allQuestions: Question[],
  performances: Map<string, QuestionPerformance>,
  criteria: SelectionCriteria
): Question[] {
  // Filter by subject and level
  let filtered = allQuestions.filter(
    (q) =>
      q.subject === criteria.subject &&
      q.level === criteria.level &&
      q.yearGroup === criteria.yearGroup
  );

  if (filtered.length === 0) {
    // Fallback: get any questions from subject
    filtered = allQuestions.filter((q) => q.subject === criteria.subject);
  }

  // Separate new and review questions
  const newQuestions: Question[] = [];
  const reviewQuestions: Question[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const question of filtered) {
    const performance = performances.get(question.id);

    if (!performance || performance.attempts === 0) {
      newQuestions.push(question);
    } else if (
      !performance.mastered &&
      performance.nextReviewDate <= today
    ) {
      reviewQuestions.push(question);
    }
  }

  // Calculate how many new vs review to select
  const newCount = Math.ceil(
    criteria.sessionSize * criteria.newPercentage
  );
  const reviewCount = Math.floor(
    criteria.sessionSize * criteria.reviewPercentage
  );

  // If not enough review questions, use more new questions
  const actualReviewCount = Math.min(reviewCount, reviewQuestions.length);
  const actualNewCount = Math.min(
    newCount + (reviewCount - actualReviewCount),
    newQuestions.length
  );

  // Calculate weights for weighted selection
  const newWeights = newQuestions.map((q) =>
    getQuestionWeight(q, performances.get(q.id), false)
  );
  const reviewWeights = reviewQuestions.map((q) =>
    getQuestionWeight(q, performances.get(q.id), true)
  );

  // Select questions using weighted random selection
  const selectedNew = weightedRandomSelect(
    newQuestions,
    newWeights,
    actualNewCount
  );
  const selectedReview = weightedRandomSelect(
    reviewQuestions,
    reviewWeights,
    actualReviewCount
  );

  // Combine
  const selected = [...selectedNew, ...selectedReview];

  // Apply mixing criteria
  if (criteria.mixDifficulty) {
    // Shuffle to mix difficulties
    return shuffle(selected);
  }

  if (criteria.mixSchools) {
    // Shuffle to mix school formats
    return shuffle(selected);
  }

  // Default: shuffle for randomization
  return shuffle(selected);
}

/**
 * Build selection criteria from session parameters
 */
export function buildSelectionCriteria(
  subject: Subject,
  level: Level,
  yearGroup: YearGroup,
  sessionSize: number = 10
): SelectionCriteria {
  let newPercentage = 0.6;
  let reviewPercentage = 0.4;

  // Adjust based on year group
  switch (yearGroup) {
    case "year-3":
    case "year-4":
      newPercentage = 0.7;
      reviewPercentage = 0.3;
      break;
    case "year-5":
      newPercentage = 0.6;
      reviewPercentage = 0.4;
      break;
    case "year-6":
      newPercentage = 0.5;
      reviewPercentage = 0.5;
      break;
  }

  return {
    subject,
    level,
    yearGroup,
    sessionSize,
    newPercentage,
    reviewPercentage,
    mixDifficulty: true,
    mixSchools: true,
    avoidRecent: true,
  };
}

/**
 * Get review priority for a question
 * Used to determine which questions to focus on
 */
export function getReviewPriority(
  performance: QuestionPerformance
): "critical" | "high" | "medium" | "low" {
  if (performance.accuracy < 50) {
    return "critical"; // Needs immediate attention
  } else if (performance.accuracy < 70) {
    return "high"; // Needs focus
  } else if (performance.accuracy < 85) {
    return "medium"; // Needs some review
  } else {
    return "low"; // Mostly mastered
  }
}

/**
 * Get questions by review priority
 */
export function getQuestionsByPriority(
  performances: QuestionPerformance[],
  priority: "critical" | "high" | "medium" | "low"
): QuestionPerformance[] {
  return performances.filter((p) => getReviewPriority(p) === priority);
}

/**
 * Recommend focus areas based on performance
 */
export interface FocusArea {
  subject: Subject;
  level: Level;
  priority: "critical" | "high" | "medium" | "low";
  averageAccuracy: number;
  questionCount: number;
}

export function getRecommendedFocusAreas(
  performances: QuestionPerformance[]
): FocusArea[] {
  const focusAreas: Map<string, FocusArea> = new Map();

  for (const performance of performances) {
    const key = `${performance.subject}-${performance.level}`;

    if (!focusAreas.has(key)) {
      focusAreas.set(key, {
        subject: performance.subject,
        level: performance.level,
        priority: getReviewPriority(performance),
        averageAccuracy: 0,
        questionCount: 0,
      });
    }

    const area = focusAreas.get(key)!;
    area.averageAccuracy += performance.accuracy;
    area.questionCount += 1;
  }

  // Calculate averages and sort by priority
  const areas = Array.from(focusAreas.values());
  areas.forEach((area) => {
    area.averageAccuracy = Math.round(
      area.averageAccuracy / area.questionCount
    );
    area.priority = getReviewPriority({
      accuracy: area.averageAccuracy,
    } as QuestionPerformance);
  });

  // Sort by priority (critical first)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return areas.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}
