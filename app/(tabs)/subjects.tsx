/**
 * Subjects Screen - Browse and select subjects for practice
 */

import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { Subject } from "@/lib/types";
import * as Haptics from "expo-haptics";

const SUBJECTS: { id: Subject; name: string; emoji: string; description: string }[] = [
  {
    id: "english",
    name: "English",
    emoji: "📖",
    description: "Phonics, Spelling, Grammar, Reading",
  },
  {
    id: "maths",
    name: "Maths",
    emoji: "🔢",
    description: "Numbers, Arithmetic, Fractions, Shapes",
  },
  {
    id: "science",
    name: "Science",
    emoji: "🔬",
    description: "Life cycles, Matter, Forces, Habitats",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    emoji: "🧩",
    description: "Logic, Patterns, Spatial, Analogies",
  },
];

export default function SubjectsScreen() {
  const router = useRouter();
  const { state } = useAppState();

  const handleSelectSubject = (subject: Subject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/level-select",
      params: { subject },
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">
              Choose a Subject
            </Text>
            <Text className="text-base text-muted">
              Select a subject to start practicing
            </Text>
          </View>

          {/* Subject Cards */}
          <View className="gap-3">
            {SUBJECTS.map((subject) => {
              const progress = state.subjectProgress[subject.id];
              const levelIndex = ["foundation", "intermediate", "advanced", "expert"].indexOf(
                progress.currentLevel
              );
              const nextLevel =
                levelIndex < 3
                  ? ["foundation", "intermediate", "advanced", "expert"][levelIndex + 1]
                  : "expert";

              return (
                <Pressable
                  key={subject.id}
                  onPress={() => handleSelectSubject(subject.id)}
                  className="bg-surface rounded-2xl p-4 gap-3 border border-border"
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-4xl">{subject.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {subject.name}
                        </Text>
                        <Text className="text-xs text-muted">
                          {subject.description}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-2xl">→</Text>
                  </View>

                  {/* Level and Progress */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-foreground capitalize">
                        Level: {progress.currentLevel}
                      </Text>
                      <Text className="text-xs text-muted">
                        {progress.questionsAnswered} questions
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            progress.questionsAnswered > 0
                              ? Math.min(
                                  (progress.questionsAnswered / 50) * 100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
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
                </Pressable>
              );
            })}
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground">
              💡 Progressive Learning
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Choose any level to practice! Foundation has 5 questions, Intermediate 7, Advanced 10, and Expert 12. Progress at your own pace.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
