/**
 * Onboarding Screen - First-time setup for the app
 * Collects child's name, year group, and optional target school
 */

import { ScrollView, Text, View, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { YearGroup } from "@/lib/types";
import * as Haptics from "expo-haptics";

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateUserProfile } = useAppState();
  const [childName, setChildName] = useState("");
  const [yearGroup, setYearGroup] = useState<YearGroup>("year-3");
  const [targetSchool, setTargetSchool] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const yearGroups: { value: YearGroup; label: string; emoji: string }[] = [
    { value: "year-3", label: "Year 3", emoji: "🌱" },
    { value: "year-4", label: "Year 4", emoji: "📈" },
    { value: "year-5", label: "Year 5", emoji: "🚀" },
    { value: "year-6", label: "Year 6", emoji: "⭐" },
  ];

  const handleGetStarted = async () => {
    if (!childName.trim()) {
      Alert.alert("Please enter your child's name");
      return;
    }

    if (!acknowledged) {
      Alert.alert("Please acknowledge that you are a parent or guardian");
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateUserProfile({
        childName: childName.trim(),
        yearGroup: yearGroup,
        targetSchool: targetSchool.trim() || undefined,
        onboardingComplete: true,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-8">
          {/* Welcome Section */}
          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-foreground text-center">
              Welcome to Study Buddy!
            </Text>
            <Text className="text-lg text-muted text-center leading-relaxed">
              Let's get started with your learning journey
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-6">
            {/* Child's Name Input */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">
                What's your name?
              </Text>
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#9BA1A6"
                value={childName}
                onChangeText={setChildName}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-base"
                editable={!isLoading}
              />
            </View>

            {/* Year Group Selection */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">
                What year are you in?
              </Text>
              <View className="gap-2">
                {yearGroups.map((yg) => (
                  <Pressable
                    key={yg.value}
                    onPress={() => {
                      setYearGroup(yg.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`flex-row items-center gap-3 p-3 rounded-lg border-2 ${
                      yearGroup === yg.value
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text className="text-2xl">{yg.emoji}</Text>
                    <Text className={`flex-1 font-semibold ${
                      yearGroup === yg.value ? "text-primary" : "text-foreground"
                    }`}>
                      {yg.label}
                    </Text>
                    {yearGroup === yg.value && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Target School Input (Optional) */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">
                Target School (Optional)
              </Text>
              <TextInput
                placeholder="e.g., Tiffin, Slough, QE"
                placeholderTextColor="#9BA1A6"
                value={targetSchool}
                onChangeText={setTargetSchool}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-base"
                editable={!isLoading}
              />
              <Text className="text-xs text-muted">
                This helps us tailor content for your school
              </Text>
            </View>

            {/* Parent/Guardian Acknowledgment */}
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-sm text-foreground font-semibold">
                Parent/Guardian Acknowledgment
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                I confirm that I am a parent or guardian of this child and have permission to use this app for their learning.
              </Text>
              <Pressable
                onPress={() => {
                  setAcknowledged(!acknowledged);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-row items-center gap-3"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center ${
                    acknowledged
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  {acknowledged && (
                    <Text className="text-white text-sm font-bold">✓</Text>
                  )}
                </View>
                <Text className="text-sm text-foreground flex-1">
                  I acknowledge this
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable
            onPress={handleGetStarted}
            disabled={isLoading}
            className={`py-4 rounded-lg items-center justify-center ${
              isLoading ? "opacity-50" : ""
            }`}
            style={({ pressed }) => [
              {
                backgroundColor: "#4F46E5",
                transform: [{ scale: pressed && !isLoading ? 0.97 : 1 }],
              },
            ]}
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading ? "Setting up..." : "Get Started"}
            </Text>
          </Pressable>

          {/* Info Section */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">
              📚 About Study Buddy
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Study Buddy helps Year 3 pupils prepare for selective grammar schools through daily practice, progressive mastery, and confidence-building exercises.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
