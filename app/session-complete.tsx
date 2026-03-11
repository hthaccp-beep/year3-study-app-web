/**
 * Session Complete Screen - Shows results, celebration, and speed analytics
 */

import { ScrollView, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

export default function SessionCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const correctCount = parseInt(params.correctCount as string) || 0;
  const totalQuestions = parseInt(params.totalQuestions as string) || 0;
  const accuracy = parseInt(params.accuracy as string) || 0;
  const points = parseInt(params.points as string) || 0;
  const subject = (params.subject as string) || "unknown";
  const timedMode = params.timedMode === "true";
  const averageTime = parseInt(params.averageTime as string) || 0;
  const speedScore = parseInt(params.speedScore as string) || 0;

  const isExcellent = accuracy >= 90;
  const isGood = accuracy >= 80;
  const isOkay = accuracy >= 60;

  const getMessage = () => {
    if (isExcellent) return "🌟 Excellent! You're a superstar!";
    if (isGood) return "🎉 Great job! Well done!";
    if (isOkay) return "👏 Good effort! Keep practicing!";
    return "💪 Keep trying! You'll improve!";
  };

  const getSpeedMessage = () => {
    if (speedScore >= 90) return "⚡ Lightning fast!";
    if (speedScore >= 75) return "🚀 Great pace!";
    if (speedScore >= 50) return "⏱️ Good timing";
    return "🐢 Take your time";
  };

  const handleReturnHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  const handlePracticeAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-8">
          {/* Celebration Header */}
          <View className="items-center gap-3">
            <Text className="text-5xl">
              {isExcellent ? "🌟" : isGood ? "🎉" : isOkay ? "👏" : "💪"}
            </Text>
            <Text className="text-3xl font-bold text-foreground text-center">
              Session Complete!
            </Text>
            <Text className="text-lg text-muted text-center">
              {getMessage()}
            </Text>
          </View>

          {/* Results Card */}
          <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
            <Text className="text-base font-semibold text-foreground capitalize">
              {subject} Results
            </Text>

            {/* Accuracy */}
            <View className="items-center gap-2">
              <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center">
                <Text className="text-4xl font-bold text-primary">
                  {accuracy}%
                </Text>
              </View>
              <Text className="text-sm text-muted">Accuracy</Text>
            </View>

            {/* Stats Grid */}
            <View className="gap-3">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-background rounded-lg p-3 items-center">
                  <Text className="text-2xl font-bold text-foreground">
                    {correctCount}/{totalQuestions}
                  </Text>
                  <Text className="text-xs text-muted">Correct</Text>
                </View>
                <View className="flex-1 bg-background rounded-lg p-3 items-center">
                  <Text className="text-2xl font-bold text-accent">
                    +{points}
                  </Text>
                  <Text className="text-xs text-muted">Points</Text>
                </View>
              </View>

              {/* Timed Mode Stats */}
              {timedMode && (
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-warning/10 rounded-lg p-3 items-center border border-warning/20">
                    <Text className="text-2xl font-bold text-warning">
                      {formatTime(averageTime)}
                    </Text>
                    <Text className="text-xs text-muted">Avg/Question</Text>
                  </View>
                  <View className="flex-1 bg-success/10 rounded-lg p-3 items-center border border-success/20">
                    <Text className="text-2xl font-bold text-success">
                      {speedScore}%
                    </Text>
                    <Text className="text-xs text-muted">Speed Score</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Speed Feedback */}
            {timedMode && (
              <View className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <Text className="text-sm text-primary font-semibold">
                  {getSpeedMessage()}
                </Text>
              </View>
            )}

            {/* Encouragement */}
            {isExcellent && (
              <View className="bg-success/10 rounded-lg p-3 border border-success/20">
                <Text className="text-sm text-success font-semibold">
                  🏆 You're progressing amazingly!
                </Text>
              </View>
            )}
            {!isExcellent && (
              <View className="bg-warning/10 rounded-lg p-3 border border-warning/20">
                <Text className="text-sm text-warning font-semibold">
                  💡 Practice makes perfect. Try again!
                </Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleReturnHome}
              className="bg-primary py-4 rounded-lg items-center"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-white font-semibold text-base">
                Return to Home
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePracticeAnother}
              className="py-4 rounded-lg items-center border border-primary"
            >
              <Text className="text-primary font-semibold text-base">
                Practice Another Subject
              </Text>
            </Pressable>
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-lg p-4 gap-2 border border-border">
            <Text className="text-xs font-semibold text-foreground">
              📚 Learning Tip
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              {timedMode
                ? "Great practice with timing! Try to improve your speed while maintaining accuracy for the real exam."
                : "Try to practice every day to build a strong learning habit. Even 5-10 minutes a day makes a big difference!"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
