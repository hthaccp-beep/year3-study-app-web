/**
 * App State Context - Manages global app state including user profile, progress, and sessions
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppState,
  UserProfile,
  SubjectProgress,
  PracticeSession,
  Subject,
  Level,
  Badge,
} from "./types";
import {
  QuestionPerformance,
  updateQuestionPerformance,
  initializePerformance,
} from "./spaced-repetition-scheduler";
import {
  SelectionCriteria,
  selectAdaptiveQuestions,
  buildSelectionCriteria,
} from "./adaptive-randomization";

const STORAGE_KEY = "year3-study-app-state";
const LEVEL_ORDER: Level[] = ["foundation", "intermediate", "advanced", "expert"];

const defaultUserProfile: UserProfile = {
  childName: "",
  yearGroup: "year-3",
  onboardingComplete: false,
  createdDate: new Date().toISOString(),
};

const defaultSubjectProgress: SubjectProgress = {
  subject: "english",
  currentLevel: "foundation",
  questionsAnswered: 0,
  correctAnswers: 0,
  totalPoints: 0,
  lastPracticedDate: "",
  levelUnlockedDate: {
    foundation: new Date().toISOString(),
    intermediate: null,
    advanced: null,
    expert: null,
  },
};

const defaultAppState: AppState = {
  userProfile: defaultUserProfile,
  subjectProgress: {
    english: { ...defaultSubjectProgress, subject: "english" },
    maths: { ...defaultSubjectProgress, subject: "maths" },
    science: { ...defaultSubjectProgress, subject: "science" },
    reasoning: { ...defaultSubjectProgress, subject: "reasoning" },
  },
  practiceSessions: [],
  questionPerformances: {},
  currentStreak: 0,
  longestStreak: 0,
  totalPointsEarned: 0,
  notificationsEnabled: true,
  darkModeEnabled: false,
};

interface AppStateContextType {
  state: AppState;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  recordPracticeSession: (session: PracticeSession) => Promise<void>;
  updateSubjectProgress: (subject: Subject, progress: Partial<SubjectProgress>) => Promise<void>;
  checkAndUnlockLevel: (subject: Subject) => Promise<boolean>;
  updateStreak: () => Promise<void>;
  getTodaysSessions: () => PracticeSession[];
  getWeeklyStats: () => {
    totalSessions: number;
    totalQuestions: number;
    totalCorrect: number;
    accuracy: number;
    totalPoints: number;
    daysWithPractice: number;
  };
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleDarkMode: (enabled: boolean) => Promise<void>;
  resetProgress: () => Promise<void>;
  loadState: () => Promise<void>;
  recordQuestionPerformance: (questionId: string, isCorrect: boolean, question: any) => Promise<void>;
  getQuestionPerformance: (questionId: string) => QuestionPerformance | undefined;
  selectSessionQuestions: (subject: Subject, level: Level, sessionSize?: number) => any[];
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultAppState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  const saveState = async (newState: AppState) => {
    setState(newState);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  };

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        setState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const newState = {
      ...state,
      userProfile: { ...state.userProfile, ...profile },
    };
    await saveState(newState);
  };

  const recordPracticeSession = async (session: PracticeSession) => {
    const newSessions = [...state.practiceSessions, session];
    const subjectProgress = state.subjectProgress[session.subject];

    const updatedProgress = {
      ...subjectProgress,
      questionsAnswered: subjectProgress.questionsAnswered + session.questionsAnswered,
      correctAnswers: subjectProgress.correctAnswers + session.correctAnswers,
      totalPoints: subjectProgress.totalPoints + session.pointsEarned,
      lastPracticedDate: session.date,
    };

    const newState = {
      ...state,
      practiceSessions: newSessions,
      subjectProgress: {
        ...state.subjectProgress,
        [session.subject]: updatedProgress,
      },
      totalPointsEarned: state.totalPointsEarned + session.pointsEarned,
    };

    await saveState(newState);
    await updateStreak();
    await checkAndUnlockLevel(session.subject);
  };

  const updateSubjectProgress = async (
    subject: Subject,
    progress: Partial<SubjectProgress>
  ) => {
    const newState = {
      ...state,
      subjectProgress: {
        ...state.subjectProgress,
        [subject]: {
          ...state.subjectProgress[subject],
          ...progress,
        },
      },
    };
    await saveState(newState);
  };

  const checkAndUnlockLevel = async (subject: Subject): Promise<boolean> => {
    const progress = state.subjectProgress[subject];
    const currentLevelIndex = LEVEL_ORDER.indexOf(progress.currentLevel);

    if (currentLevelIndex >= LEVEL_ORDER.length - 1) {
      return false; // Already at max level
    }

    // Get sessions for this subject at current level
    const sessionsAtCurrentLevel = state.practiceSessions.filter(
      (s) => s.subject === subject && s.level === progress.currentLevel
    );

    if (sessionsAtCurrentLevel.length < 3) {
      return false; // Need at least 3 sessions
    }

    // Check if last 3 sessions have 80%+ accuracy
    const lastThreeSessions = sessionsAtCurrentLevel.slice(-3);
    const allAbove80 = lastThreeSessions.every((s) => s.accuracy >= 80);

    if (allAbove80) {
      const nextLevel = LEVEL_ORDER[currentLevelIndex + 1];
      const newState = {
        ...state,
        subjectProgress: {
          ...state.subjectProgress,
          [subject]: {
            ...progress,
            currentLevel: nextLevel,
            levelUnlockedDate: {
              ...progress.levelUnlockedDate,
              [nextLevel]: new Date().toISOString(),
            },
          },
        },
      };
      await saveState(newState);
      return true;
    }

    return false;
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const todaysSessions = state.practiceSessions.filter(
      (s) => new Date(s.date).toDateString() === today
    );

    const yesterdaysSessions = state.practiceSessions.filter(
      (s) => new Date(s.date).toDateString() === yesterday
    );

    let newStreak = state.currentStreak;
    let newLongestStreak = state.longestStreak;

    if (todaysSessions.length > 0) {
      // Has practice today
      if (yesterdaysSessions.length > 0) {
        // Had practice yesterday, continue streak
        newStreak = state.currentStreak + 1;
      } else if (state.currentStreak === 0) {
        // Starting new streak
        newStreak = 1;
      }
    } else {
      // No practice today
      if (yesterdaysSessions.length === 0 && state.currentStreak > 0) {
        // Streak broken
        newLongestStreak = Math.max(state.longestStreak, state.currentStreak);
        newStreak = 0;
      }
    }

    if (newStreak !== state.currentStreak || newLongestStreak !== state.longestStreak) {
      const newState = {
        ...state,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      };
      await saveState(newState);
    }
  };

  const getTodaysSessions = () => {
    const today = new Date().toDateString();
    return state.practiceSessions.filter(
      (s) => new Date(s.date).toDateString() === today
    );
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekSessions = state.practiceSessions.filter((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekAgo && sessionDate <= now;
    });

    const totalQuestions = weekSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = weekSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalPoints = weekSessions.reduce((sum, s) => sum + s.pointsEarned, 0);

    const daysWithPractice = new Set(
      weekSessions.map((s) => new Date(s.date).toDateString())
    ).size;

    return {
      totalSessions: weekSessions.length,
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalPoints,
      daysWithPractice,
    };
  };

  const toggleNotifications = async (enabled: boolean) => {
    const newState = {
      ...state,
      notificationsEnabled: enabled,
    };
    await saveState(newState);
  };

  const toggleDarkMode = async (enabled: boolean) => {
    const newState = {
      ...state,
      darkModeEnabled: enabled,
    };
    await saveState(newState);
  };

  const resetProgress = async () => {
    await saveState(defaultAppState);
  };

  const recordQuestionPerformance = async (
    questionId: string,
    isCorrect: boolean,
    question: any
  ) => {
    const performances = state.questionPerformances || {};
    let performance = performances[questionId];

    if (!performance) {
      performance = initializePerformance(question);
    }

    const updated = updateQuestionPerformance(performance, isCorrect);
    const newPerformances = {
      ...performances,
      [questionId]: updated,
    };

    const newState = {
      ...state,
      questionPerformances: newPerformances,
    };

    await saveState(newState);
  };

  const getQuestionPerformance = (questionId: string) => {
    return state.questionPerformances?.[questionId];
  };

  const selectSessionQuestions = (
    subject: Subject,
    level: Level,
    sessionSize: number = 10
  ) => {
    return [];
  };

  const value: AppStateContextType = {
    state,
    updateUserProfile,
    recordPracticeSession,
    updateSubjectProgress,
    checkAndUnlockLevel,
    updateStreak,
    getTodaysSessions,
    getWeeklyStats,
    toggleNotifications,
    toggleDarkMode,
    resetProgress,
    loadState,
    recordQuestionPerformance,
    getQuestionPerformance,
    selectSessionQuestions,
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
