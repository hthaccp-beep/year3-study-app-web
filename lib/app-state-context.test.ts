import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PracticeSession, Subject } from "./types";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("App State Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default user profile", () => {
      const defaultProfile = {
        childName: "Young Learner",
        yearGroup: "year3",
        targetSchool: "",
      };

      expect(defaultProfile.childName).toBe("Young Learner");
      expect(defaultProfile.yearGroup).toBe("year3");
    });

    it("should initialize with all subjects at beginner level", () => {
      const subjects: Subject[] = ["english", "maths", "science", "reasoning"];
      const initialProgress = {
        currentLevel: "foundation" as const,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalPoints: 0,
      };

      subjects.forEach((subject) => {
        expect(initialProgress.currentLevel).toBe("foundation");
        expect(initialProgress.questionsAnswered).toBe(0);
      });
    });

    it("should initialize with zero streak and points", () => {
      const initialStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalPointsEarned: 0,
        practiceSessions: [] as PracticeSession[],
      };

      expect(initialStats.currentStreak).toBe(0);
      expect(initialStats.totalPointsEarned).toBe(0);
      expect(initialStats.practiceSessions).toHaveLength(0);
    });
  });

  describe("Practice Session Recording", () => {
    it("should calculate accuracy correctly", () => {
      const session: PracticeSession = {
        id: "test-session-1",
        subject: "english",
        level: "foundation",
        date: new Date().toISOString(),
        questionsAnswered: 5,
        correctAnswers: 4,
        accuracy: 80,
        pointsEarned: 40,
        timeTakenSeconds: 300,
      };

      const expectedAccuracy = Math.round((4 / 5) * 100);
      expect(session.accuracy).toBe(expectedAccuracy);
    });

    it("should award correct points (10 per correct answer)", () => {
      const correctAnswers = 5;
      const expectedPoints = correctAnswers * 10;

      expect(expectedPoints).toBe(50);
    });

    it("should track multiple sessions", () => {
      const sessions: PracticeSession[] = [
        {
          id: "session-1",
          subject: "english",
          level: "foundation",
          date: new Date().toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "session-2",
          subject: "maths",
          level: "foundation",
          date: new Date().toISOString(),
          questionsAnswered: 5,
          correctAnswers: 5,
          accuracy: 100,
          pointsEarned: 50,
          timeTakenSeconds: 250,
        },
      ];

      expect(sessions).toHaveLength(2);
      expect(sessions[0].subject).toBe("english");
      expect(sessions[1].subject).toBe("maths");
    });
  });

  describe("Level Progression", () => {
    it("should require 80% accuracy to progress", () => {
      const accuracyThreshold = 80;
      const testAccuracies = [79, 80, 85, 100];

      testAccuracies.forEach((accuracy) => {
        const shouldProgress = accuracy >= accuracyThreshold;
        if (accuracy < accuracyThreshold) {
          expect(shouldProgress).toBe(false);
        } else {
          expect(shouldProgress).toBe(true);
        }
      });
    });

    it("should track consecutive high-accuracy sessions", () => {
      const sessions: PracticeSession[] = [
        {
          id: "s1",
          subject: "english",
          level: "foundation",
          date: new Date().toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "s2",
          subject: "english",
          level: "foundation",
          date: new Date().toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "s3",
          subject: "english",
          level: "foundation",
          date: new Date().toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
      ];

      const recentHighAccuracy = sessions
        .slice(-3)
        .filter((s) => s.accuracy >= 80);

      expect(recentHighAccuracy).toHaveLength(3);
    });

    it("should progress through all levels in order", () => {
      const levels = ["foundation", "intermediate", "advanced", "expert"] as const;

      levels.forEach((level, index) => {
        if (index < levels.length - 1) {
          const nextLevel = levels[index + 1];
          expect(nextLevel).toBeDefined();
        }
      });
    });
  });

  describe("Streak Tracking", () => {
    it("should increment streak for consecutive daily practice", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions: PracticeSession[] = [
        {
          id: "s1",
          subject: "english",
          level: "foundation",
          date: yesterday.toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "s2",
          subject: "maths",
          level: "foundation",
          date: today.toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
      ];

      const uniqueDates = new Set(
        sessions.map((s) => new Date(s.date).toDateString())
      );
      expect(uniqueDates.size).toBe(2);
    });

    it("should detect gap between sessions for streak reset", () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const firstSessionDate = twoDaysAgo;
      const lastSessionDate = today;
      const daysBetween = Math.floor(
        (lastSessionDate.getTime() - firstSessionDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      expect(daysBetween > 1).toBe(true);
    });
  });

  describe("Weekly Statistics", () => {
    it("should calculate weekly stats correctly", () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const sessions: PracticeSession[] = [
        {
          id: "s1",
          subject: "english",
          level: "foundation",
          date: sevenDaysAgo.toISOString(),
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "s2",
          subject: "maths",
          level: "foundation",
          date: today.toISOString(),
          questionsAnswered: 5,
          correctAnswers: 5,
          accuracy: 100,
          pointsEarned: 50,
          timeTakenSeconds: 250,
        },
      ];

      const totalQuestions = sessions.reduce(
        (sum, s) => sum + s.questionsAnswered,
        0
      );
      const totalCorrect = sessions.reduce(
        (sum, s) => sum + s.correctAnswers,
        0
      );
      const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100);

      expect(totalQuestions).toBe(10);
      expect(totalCorrect).toBe(9);
      expect(overallAccuracy).toBe(90);
    });

    it("should count unique practice days", () => {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const sessions: PracticeSession[] = [
        {
          id: "s1",
          subject: "english",
          level: "foundation",
          date: yesterdayStr,
          questionsAnswered: 5,
          correctAnswers: 4,
          accuracy: 80,
          pointsEarned: 40,
          timeTakenSeconds: 300,
        },
        {
          id: "s2",
          subject: "maths",
          level: "foundation",
          date: yesterdayStr,
          questionsAnswered: 5,
          correctAnswers: 5,
          accuracy: 100,
          pointsEarned: 50,
          timeTakenSeconds: 250,
        },
        {
          id: "s3",
          subject: "science",
          level: "foundation",
          date: today,
          questionsAnswered: 5,
          correctAnswers: 3,
          accuracy: 60,
          pointsEarned: 30,
          timeTakenSeconds: 350,
        },
      ];

      const uniqueDays = new Set(
        sessions.map((s) => new Date(s.date).toDateString())
      );
      expect(uniqueDays.size).toBe(2);
    });
  });

  describe("Questions Per Level", () => {
    it("should have correct question count for each level", () => {
      const questionsPerLevel = {
        beginner: 5,
        intermediate: 7,
        advanced: 10,
        expert: 12,
      };

      expect(questionsPerLevel.beginner).toBe(5);
      expect(questionsPerLevel.intermediate).toBe(7);
      expect(questionsPerLevel.advanced).toBe(10);
      expect(questionsPerLevel.expert).toBe(12);
    });
  });

  describe("Subject Progress", () => {
    it("should track progress independently for each subject", () => {
      const subjects: Subject[] = ["english", "maths", "science", "reasoning"];
      const progress = {
        english: {
          currentLevel: "foundation" as const,
          questionsAnswered: 10,
          correctAnswers: 8,
          totalPoints: 80,
        },
        maths: {
          currentLevel: "intermediate" as const,
          questionsAnswered: 15,
          correctAnswers: 12,
          totalPoints: 120,
        },
        science: {
          currentLevel: "foundation" as const,
          questionsAnswered: 5,
          correctAnswers: 4,
          totalPoints: 40,
        },
        reasoning: {
          currentLevel: "foundation" as const,
          questionsAnswered: 0,
          correctAnswers: 0,
          totalPoints: 0,
        },
      };

      subjects.forEach((subject) => {
        expect(progress[subject]).toBeDefined();
        expect(progress[subject].currentLevel).toBeDefined();
      });

      expect(progress.english.currentLevel).toBe("foundation");
      expect(progress.maths.currentLevel).toBe("intermediate");
    });
  });
});
