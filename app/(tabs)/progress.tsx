/**
 * Progress Tab Screen - Shows detailed weekly stats and subject breakdown
 */

import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { Subject } from "@/lib/types";

const SUBJECTS: { id: Subject; name: string; emoji: string }[] = [
  { id: "english", name: "English", emoji: "📖" },
  { id: "maths", name: "Maths", emoji: "🔢" },
  { id: "science", name: "Science", emoji: "🔬" },
  { id: "reasoning", name: "Reasoning", emoji: "🧩" },
];

export default function ProgressTabScreen() {
  const { state, getWeeklyStats } = useAppState();
  const weeklyStats = getWeeklyStats();

  const getProgressPercentage = (subject: Subject) => {
    const progress = state.subjectProgress[subject];
    const levelProgression: Record<string, number> = {
      beginner: 0,
      intermediate: 25,
      advanced: 50,
      expert: 100,
    };
    return levelProgression[progress.currentLevel] || 0;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">
              Your Progress
            </Text>
            <Text className="text-base text-muted">
              Track your learning journey
            </Text>
          </View>

          {/* Weekly Overview */}
          <View className="bg-primary/10 rounded-2xl p-4 gap-4 border border-primary/20">
            <Text className="text-base font-semibold text-foreground">
              This Week's Performance
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Total Sessions</Text>
                <Text className="text-2xl font-bold text-primary">
                  {weeklyStats.totalSessions}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Questions Answered</Text>
                <Text className="text-2xl font-bold text-primary">
                  {weeklyStats.totalQuestions}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Overall Accuracy</Text>
                <Text className="text-2xl font-bold text-success">
                  {weeklyStats.accuracy}%
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Days Practiced</Text>
                <Text className="text-2xl font-bold text-accent">
                  {weeklyStats.daysWithPractice}/7
                </Text>
              </View>
            </View>
          </View>

          {/* Subject Breakdown */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Subject Progress
            </Text>
            {SUBJECTS.map((subject) => {
              const progress = state.subjectProgress[subject.id];
              const percentage = getProgressPercentage(subject.id);
              return (
                <View
                  key={subject.id}
                  className="bg-surface rounded-xl p-4 gap-3 border border-border"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-2xl">{subject.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {subject.name}
                        </Text>
                        <Text className="text-xs text-muted capitalize">
                          {progress.currentLevel}
                        </Text>
                      </View>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-primary">
                        {progress.questionsAnswered}
                      </Text>
                      <Text className="text-xs text-muted">Questions</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-muted">
                        Progress to next level
                      </Text>
                      <Text className="text-xs font-semibold text-primary">
                        {percentage}%
                      </Text>
                    </View>
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                  </View>

                  {/* Stats */}
                  <View className="flex-row gap-2 pt-2">
                    <View className="flex-1 bg-background rounded-lg p-2 items-center">
                      <Text className="text-xs font-bold text-foreground">
                        {progress.correctAnswers}
                      </Text>
                      <Text className="text-xs text-muted">Correct</Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-2 items-center">
                      <Text className="text-xs font-bold text-success">
                        {progress.questionsAnswered > 0
                          ? Math.round(
                              (progress.correctAnswers /
                                progress.questionsAnswered) *
                                100
                            )
                          : 0}
                        %
                      </Text>
                      <Text className="text-xs text-muted">Accuracy</Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-2 items-center">
                      <Text className="text-xs font-bold text-accent">
                        {progress.totalPoints}
                      </Text>
                      <Text className="text-xs text-muted">Points</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Achievements */}
          <View className="bg-accent/10 rounded-xl p-4 gap-2 border border-accent/20">
            <Text className="text-base font-semibold text-foreground">
              🏆 Keep It Up!
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              Your current streak is <Text className="font-bold">{state.currentStreak} days</Text>. Your longest streak was <Text className="font-bold">{state.longestStreak} days</Text>.
            </Text>
          </View>

          {/* Motivational Message */}
          <View className="bg-success/10 rounded-xl p-4 gap-2 border border-success/20">
            <Text className="text-sm text-foreground leading-relaxed">
              💡 You've earned <Text className="font-bold">{state.totalPointsEarned} points</Text> so far! Keep practicing to unlock new levels and badges.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
