/**
 * Core TypeScript types for the Year 3 Study App
 */

export type Level = "foundation" | "intermediate" | "advanced" | "expert";
export type Subject = "english" | "maths" | "science" | "reasoning";
export type QuestionType = "multiple-choice" | "text-input" | "matching" | "sorting" | "visual" | "cloze-word" | "cloze-character" | "odd-one-out" | "multi-step" | "comprehension-written" | "problem-solving";
export type YearGroup = "year-3" | "year-4" | "year-5" | "year-6";

/**
 * Time limits per level (in seconds per question)
 */
export const TIME_LIMITS: Record<Level, number> = {
  foundation: 120,
  intermediate: 90,
  advanced: 60,
  expert: 45,
};

/**
 * Question structure for practice sessions
 */
export interface Question {
  id: string;
  subject: Subject;
  level: Level;
  yearGroup: YearGroup;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  curriculumReference?: string;
  hint?: string;
}

/**
 * User's progress for a specific subject
 */
export interface SubjectProgress {
  subject: Subject;
  currentLevel: Level;
  questionsAnswered: number;
  correctAnswers: number;
  totalPoints: number;
  lastPracticedDate: string;
  levelUnlockedDate: Record<Level, string | null>;
}

/**
 * Daily practice session record
 */
export interface PracticeSession {
  id: string;
  subject: Subject;
  level: Level;
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  pointsEarned: number;
  timeTakenSeconds: number;
  timedMode?: boolean;
  averageTimePerQuestion?: number;
  speedScore?: number;
}

/**
 * User profile and app state
 */
export interface UserProfile {
  childName: string;
  yearGroup: YearGroup;
  targetSchool?: string;
  onboardingComplete: boolean;
  createdDate: string;
}

/**
 * App-wide state
 */
export interface AppState {
  userProfile: UserProfile;
  subjectProgress: Record<Subject, SubjectProgress>;
  practiceSessions: PracticeSession[];
  questionPerformances?: Record<string, any>; // Map of question ID to QuestionPerformance
  currentStreak: number;
  longestStreak: number;
  totalPointsEarned: number;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
}

/**
 * Practice session in progress
 */
export interface ActiveSession {
  subject: Subject;
  level: Level;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (string | string[] | null)[];
  startTime: number;
}

/**
 * Level progression criteria
 */
export interface LevelCriteria {
  level: Level;
  questionsPerSession: number;
  requiredAccuracy: number;
  consecutiveSessionsRequired: number;
}

/**
 * Weekly statistics
 */
export interface WeeklyStats {
  weekStart: string;
  totalPracticeSessions: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  totalPointsEarned: number;
  totalTimeMinutes: number;
  daysWithPractice: number;
  practiceByDay: Record<string, number>;
}

/**
 * Achievement/Badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedDate: string | null;
  type: "level-up" | "streak" | "accuracy" | "milestone";
}

/**
 * Mock test session
 */
export interface MockTest {
  id: string;
  yearGroup: YearGroup;
  date: string;
  scheduledDate?: string;
  completedDate?: string;
  subjects: {
    english: { correctAnswers: number; totalQuestions: number; accuracy: number };
    maths: { correctAnswers: number; totalQuestions: number; accuracy: number };
    science: { correctAnswers: number; totalQuestions: number; accuracy: number };
    reasoning: { correctAnswers: number; totalQuestions: number; accuracy: number };
  };
  overallAccuracy: number;
  totalPointsEarned: number;
  timeTakenSeconds: number;
  status: "scheduled" | "in-progress" | "completed";
}
