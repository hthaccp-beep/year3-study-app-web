/**
 * Parent Dashboard Analytics
 * Weakness heatmap, speed analysis, progress tracking
 */

import { Subject, Level, PracticeSession } from "./types";

/**
 * Subject performance metrics
 */
export interface SubjectMetrics {
  subject: Subject;
  totalSessions: number;
  averageAccuracy: number;
  averageSpeed: number;
  weakAreas: string[];
  strongAreas: string[];
  lastPracticed: string;
  trend: "improving" | "stable" | "declining";
}

/**
 * Weakness heatmap data
 */
export interface WeaknessHeatmap {
  [subject: string]: {
    [level: string]: {
      accuracy: number;
      speed: number;
      difficulty: "easy" | "medium" | "hard"; // Based on performance
      lastPracticed: string;
    };
  };
}

/**
 * Speed analysis alert
 */
export interface SpeedAlert {
  id: string;
  type: "slow-comprehension" | "slow-arithmetic" | "slow-reasoning" | "slow-overall";
  subject: Subject;
  level: Level;
  averageTime: number;
  recommendedTime: number;
  message: string;
  severity: "info" | "warning" | "critical";
}

/**
 * Parent dashboard summary
 */
export interface ParentDashboardSummary {
  childName: string;
  yearGroup: string;
  overallAccuracy: number;
  overallSpeed: number;
  currentStreak: number;
  totalSessions: number;
  thisWeekSessions: number;
  targetSchool?: string;
  subjectMetrics: SubjectMetrics[];
  weaknessHeatmap: WeaknessHeatmap;
  speedAlerts: SpeedAlert[];
  recentSessions: PracticeSession[];
}

/**
 * Calculate subject metrics
 */
export function calculateSubjectMetrics(
  subject: Subject,
  sessions: PracticeSession[]
): SubjectMetrics {
  const subjectSessions = sessions.filter((s) => s.subject === subject);

  if (subjectSessions.length === 0) {
    return {
      subject,
      totalSessions: 0,
      averageAccuracy: 0,
      averageSpeed: 0,
      weakAreas: [],
      strongAreas: [],
      lastPracticed: "",
      trend: "stable",
    };
  }

  const totalAccuracy = subjectSessions.reduce((sum, s) => sum + s.accuracy, 0);
  const averageAccuracy = Math.round(totalAccuracy / subjectSessions.length);

  const totalSpeed = subjectSessions.reduce(
    (sum, s) => sum + (s.speedScore || 0),
    0
  );
  const averageSpeed = Math.round(totalSpeed / subjectSessions.length);

  // Determine trend
  const recentSessions = subjectSessions.slice(-5);
  const oldSessions = subjectSessions.slice(0, Math.max(1, subjectSessions.length - 5));

  const recentAvg =
    recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
  const oldAvg =
    oldSessions.reduce((sum, s) => sum + s.accuracy, 0) / oldSessions.length;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (recentAvg > oldAvg + 5) trend = "improving";
  if (recentAvg < oldAvg - 5) trend = "declining";

  return {
    subject,
    totalSessions: subjectSessions.length,
    averageAccuracy,
    averageSpeed,
    weakAreas: [],
    strongAreas: [],
    lastPracticed: subjectSessions[subjectSessions.length - 1].date,
    trend,
  };
}

/**
 * Build weakness heatmap
 */
export function buildWeaknessHeatmap(
  sessions: PracticeSession[]
): WeaknessHeatmap {
  const heatmap: WeaknessHeatmap = {};

  const subjects: Subject[] = ["english", "maths", "science", "reasoning"];
  const levels: Level[] = ["foundation", "intermediate", "advanced", "expert"];

  for (const subject of subjects) {
    heatmap[subject] = {};

    for (const level of levels) {
      const levelSessions = sessions.filter(
        (s) => s.subject === subject && s.level === level
      );

      if (levelSessions.length > 0) {
        const avgAccuracy =
          levelSessions.reduce((sum, s) => sum + s.accuracy, 0) /
          levelSessions.length;
        const avgSpeed =
          levelSessions.reduce((sum, s) => sum + (s.speedScore || 0), 0) /
          levelSessions.length;

        let difficulty: "easy" | "medium" | "hard" = "medium";
        if (avgAccuracy < 60) difficulty = "hard";
        if (avgAccuracy > 85) difficulty = "easy";

        heatmap[subject][level] = {
          accuracy: Math.round(avgAccuracy),
          speed: Math.round(avgSpeed),
          difficulty,
          lastPracticed: levelSessions[levelSessions.length - 1].date,
        };
      }
    }
  }

  return heatmap;
}

/**
 * Detect speed alerts
 */
export function detectSpeedAlerts(
  sessions: PracticeSession[]
): SpeedAlert[] {
  const alerts: SpeedAlert[] = [];

  // Analyze by subject
  const subjects: Subject[] = ["english", "maths", "science", "reasoning"];

  for (const subject of subjects) {
    const subjectSessions = sessions.filter((s) => s.subject === subject);

    if (subjectSessions.length < 3) continue;

    const avgTime =
      subjectSessions.reduce((sum, s) => sum + (s.averageTimePerQuestion || 0), 0) /
      subjectSessions.length;

    // Recommended time based on level
    const recommendedTimes: Record<Level, number> = {
      foundation: 120,
      intermediate: 90,
      advanced: 60,
      expert: 45,
    };

    const recentLevel = subjectSessions[subjectSessions.length - 1].level;
    const recommendedTime = recommendedTimes[recentLevel];

    if (avgTime > recommendedTime * 1.5) {
      let type: SpeedAlert["type"] = "slow-overall";
      if (subject === "english") type = "slow-comprehension";
      if (subject === "maths") type = "slow-arithmetic";
      if (subject === "reasoning") type = "slow-reasoning";

      alerts.push({
        id: `alert-${subject}-${Date.now()}`,
        type,
        subject,
        level: recentLevel,
        averageTime: Math.round(avgTime),
        recommendedTime,
        message: `${subject} is taking ${Math.round(avgTime / recommendedTime)}x longer than recommended. Consider focusing on speed drills.`,
        severity: avgTime > recommendedTime * 2 ? "critical" : "warning",
      });
    }
  }

  return alerts;
}

/**
 * Calculate overall accuracy
 */
export function calculateOverallAccuracy(
  sessions: PracticeSession[]
): number {
  if (sessions.length === 0) return 0;

  const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0);
  return Math.round(totalAccuracy / sessions.length);
}

/**
 * Calculate overall speed
 */
export function calculateOverallSpeed(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;

  const totalSpeed = sessions.reduce((sum, s) => sum + (s.speedScore || 0), 0);
  return Math.round(totalSpeed / sessions.length);
}

/**
 * Get this week's sessions
 */
export function getThisWeekSessions(sessions: PracticeSession[]): PracticeSession[] {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    return sessionDate >= weekAgo && sessionDate <= today;
  });
}

/**
 * Get recommendations based on performance
 */
export function getRecommendations(
  metrics: SubjectMetrics[]
): string[] {
  const recommendations: string[] = [];

  for (const metric of metrics) {
    if (metric.averageAccuracy < 70) {
      recommendations.push(
        `Focus on ${metric.subject} - current accuracy is ${metric.averageAccuracy}%. Try Foundation level to build confidence.`
      );
    }

    if (metric.trend === "declining") {
      recommendations.push(
        `${metric.subject} performance is declining. Consider reviewing recent mistakes or taking a break.`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Great progress! Continue with current routine.");
  }

  return recommendations;
}

/**
 * Export parent dashboard summary
 */
export function generateParentDashboardSummary(
  childName: string,
  yearGroup: string,
  targetSchool: string | undefined,
  sessions: PracticeSession[],
  currentStreak: number
): ParentDashboardSummary {
  const subjects: Subject[] = ["english", "maths", "science", "reasoning"];
  const subjectMetrics = subjects.map((subject) =>
    calculateSubjectMetrics(subject, sessions)
  );

  const weaknessHeatmap = buildWeaknessHeatmap(sessions);
  const speedAlerts = detectSpeedAlerts(sessions);
  const thisWeekSessions = getThisWeekSessions(sessions);

  return {
    childName,
    yearGroup,
    overallAccuracy: calculateOverallAccuracy(sessions),
    overallSpeed: calculateOverallSpeed(sessions),
    currentStreak,
    totalSessions: sessions.length,
    thisWeekSessions: thisWeekSessions.length,
    targetSchool,
    subjectMetrics,
    weaknessHeatmap,
    speedAlerts,
    recentSessions: sessions.slice(-10),
  };
}
