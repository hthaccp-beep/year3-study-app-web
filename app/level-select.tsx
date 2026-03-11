/**
 * Level Selection Screen - Allows users to choose their difficulty level
 * Includes option to enable timed mode for exam preparation
 */

import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Subject, Level } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

const LEVELS: { level: Level; label: string; description: string; icon: string }[] = [
  {
    level: "foundation",
    label: "Foundation",
    description: "Start here - Build confidence with basics",
    icon: "🌱",
  },
  {
    level: "intermediate",
    label: "Intermediate",
    description: "Ready for a challenge - Develop skills",
    icon: "📈",
  },
  {
    level: "advanced",
    label: "Advanced",
    description: "Push yourself - Master complex topics",
    icon: "🚀",
  },
  {
    level: "expert",
    label: "Expert",
    description: "Ultimate challenge - 11+ exam level",
    icon: "⭐",
  },
];

export default function LevelSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();
  const subject = (params.subject as Subject) || "english";
  const [timedModeEnabled, setTimedModeEnabled] = useState(false);

  const handleSelectLevel = (level: Level) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/practice",
      params: { subject, level, timed: timedModeEnabled ? "true" : "false" },
    });
  };

  const handleToggleTimed = (value: boolean) => {
    setTimedModeEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Choose Your Level</Text>
            <Text className="text-base text-muted">
              Select the difficulty level that matches your current ability
            </Text>
          </View>

          {/* Timed Mode Toggle */}
          <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground">
                ⏱️ Timed Mode
              </Text>
              <Text className="text-sm text-muted">
                Practice with time limits like the real exam
              </Text>
            </View>
            <Switch
              value={timedModeEnabled}
              onValueChange={handleToggleTimed}
            />
          </View>

          {/* Time Limits Info */}
          {timedModeEnabled && (
            <View className="bg-warning/10 rounded-xl p-4 gap-2 border border-warning/20">
              <Text className="text-sm font-semibold text-warning">⏰ Time Limits</Text>
              <View className="gap-1">
                <Text className="text-xs text-foreground">Foundation: 2 min/question</Text>
                <Text className="text-xs text-foreground">Intermediate: 1.5 min/question</Text>
                <Text className="text-xs text-foreground">Advanced: 1 min/question</Text>
                <Text className="text-xs text-foreground">Expert: 45 sec/question</Text>
              </View>
            </View>
          )}

          {/* Level Cards */}
          <View className="gap-4">
            {LEVELS.map((item) => (
              <Pressable
                key={item.level}
                onPress={() => handleSelectLevel(item.level)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View className="bg-surface rounded-2xl p-5 border border-border">
                  <View className="flex-row items-start gap-4">
                    {/* Icon */}
                    <Text className="text-4xl">{item.icon}</Text>

                    {/* Content */}
                    <View className="flex-1 gap-1">
                      <Text className="text-xl font-bold text-foreground">{item.label}</Text>
                      <Text className="text-sm text-muted leading-relaxed">
                        {item.description}
                      </Text>
                    </View>

                    {/* Arrow */}
                    <Text className="text-2xl text-primary">→</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 rounded-xl p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Pro Tip</Text>
            <Text className="text-sm text-foreground leading-relaxed">
              You can switch levels anytime! Try different levels to find what works best for you. Enable timed mode to practice under exam conditions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
