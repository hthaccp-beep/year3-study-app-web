/**
 * Home Screen - Dashboard showing daily progress and quick-start buttons
 */

import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { Subject } from "@/lib/types";
import * as Haptics from "expo-haptics";

const SUBJECTS: { id: Subject; name: string; emoji: string }[] = [
  { id: "english", name: "English", emoji: "📖" },
  { id: "maths", name: "Maths", emoji: "🔢" },
  { id: "science", name: "Science", emoji: "🔬" },
  { id: "reasoning", name: "Reasoning", emoji: "🧩" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAppState();

  const handleQuickStart = (subject: Subject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/level-select",
      params: { subject },
    });
  };

  // Calculate today's stats
  const today = new Date().toDateString();
  const todaysSessions = state.practiceSessions.filter(
    (s) => new Date(s.date).toDateString() === today
  );
  const todaysCorrect = todaysSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const todaysTotal = todaysSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="p-6">
        <View className="gap-8">
          {/* Greeting */}
          <View className="gap-2">
            <Text className="text-4xl font-bold text-foreground">
              Hello! 👋
            </Text>
            <Text className="text-base text-muted">
              Ready to practice today?
            </Text>
          </View>

          {/* Today's Progress Card */}
          <View className="bg-surface rounded-3xl p-6 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Today's Progress</Text>
              <Text className="text-3xl">🎯</Text>
            </View>

            <View className="flex-row gap-4 justify-around">
              {/* Sessions */}
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold text-primary">
                  {todaysSessions.length}
                </Text>
                <Text className="text-xs text-muted">Sessions</Text>
              </View>

              {/* Streak */}
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold text-success">
                  {state.currentStreak}
                </Text>
                <Text className="text-xs text-muted">Day Streak</Text>
                {state.currentStreak > 0 && <Text className="text-lg">🔥</Text>}
              </View>

              {/* Points */}
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold text-accent">
                  {todaysSessions.reduce((sum, s) => sum + s.pointsEarned, 0)}
                </Text>
                <Text className="text-xs text-muted">Points</Text>
              </View>
            </View>

            {/* Accuracy Bar */}
            {todaysTotal > 0 && (
              <View className="gap-2 pt-2 border-t border-border">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Accuracy</Text>
                  <Text className="text-sm font-bold text-primary">
                    {Math.round((todaysCorrect / todaysTotal) * 100)}%
                  </Text>
                </View>
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(todaysCorrect / todaysTotal) * 100}%` }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* This Week Stats */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-lg font-bold text-foreground">This Week</Text>
            <View className="flex-row gap-3 justify-around">
              <View className="flex-1 items-center gap-1">
                <Text className="text-2xl font-bold text-foreground">
                  {new Set(state.practiceSessions.map((s) => new Date(s.date).toDateString())).size}
                </Text>
                <Text className="text-xs text-muted text-center">Days Practiced</Text>
              </View>
              <View className="flex-1 items-center gap-1">
                <Text className="text-2xl font-bold text-foreground">
                  {state.practiceSessions.length}
                </Text>
                <Text className="text-xs text-muted text-center">Sessions</Text>
              </View>
              <View className="flex-1 items-center gap-1">
                <Text className="text-2xl font-bold text-foreground">
                  {state.totalPointsEarned}
                </Text>
                <Text className="text-xs text-muted text-center">Total Points</Text>
              </View>
            </View>
          </View>

          {/* Quick Start Buttons */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Quick Start</Text>
            <View className="gap-2">
              {SUBJECTS.map((subject) => (
                <Pressable
                  key={subject.id}
                  onPress={() => handleQuickStart(subject.id)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View className="flex-row items-center gap-3 bg-primary rounded-xl p-4">
                    <Text className="text-2xl">{subject.emoji}</Text>
                    <Text className="text-base font-semibold text-background flex-1">
                      Practice {subject.name}
                    </Text>
                    <Text className="text-xl text-background">→</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Motivational Message */}
          <View className="bg-success/10 rounded-xl p-4 gap-2 border border-success/20">
            <Text className="text-sm font-semibold text-success">✨ Keep Going!</Text>
            <Text className="text-xs text-foreground leading-relaxed">
              Every question you answer brings you closer to your goal. You're doing great!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
