/**
 * Settings Screen - User profile and app preferences
 */

import { ScrollView, Text, View, Pressable, Alert, Switch } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { YearGroup } from "@/lib/types";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const { state, updateUserProfile, toggleNotifications, toggleDarkMode, resetProgress } =
    useAppState();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    state.notificationsEnabled
  );
  const [darkModeEnabled, setDarkModeEnabled] = useState(state.darkModeEnabled);
  const [showYearGroupSelector, setShowYearGroupSelector] = useState(false);

  const yearGroups: { value: YearGroup; label: string; emoji: string }[] = [
    { value: "year-3", label: "Year 3", emoji: "🌱" },
    { value: "year-4", label: "Year 4", emoji: "📈" },
    { value: "year-5", label: "Year 5", emoji: "🚀" },
    { value: "year-6", label: "Year 6", emoji: "⭐" },
  ];

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await toggleNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkModeEnabled(value);
    await toggleDarkMode(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleChangeYearGroup = async (newYearGroup: YearGroup) => {
    await updateUserProfile({ yearGroup: newYearGroup });
    setShowYearGroupSelector(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Reset",
          onPress: async () => {
            await resetProgress();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Progress Reset", "All your progress has been reset.");
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">
              Settings
            </Text>
            <Text className="text-base text-muted">
              Manage your profile and preferences
            </Text>
          </View>

          {/* Profile Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Profile
            </Text>
            <View className="bg-surface rounded-xl p-4 gap-3 border border-border">
              <View className="gap-1">
                <Text className="text-sm text-muted">Child's Name</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {state.userProfile.childName}
                </Text>
              </View>
              <View className="h-px bg-border" />
              <Pressable
                onPress={() => setShowYearGroupSelector(!showYearGroupSelector)}
                className="gap-1"
              >
                <Text className="text-sm text-muted">Year Group</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-foreground">
                    {state.userProfile.yearGroup.replace('year-', 'Year ')}
                  </Text>
                  <Text className="text-lg">›</Text>
                </View>
              </Pressable>
              {showYearGroupSelector && (
                <View className="gap-2 pt-3 border-t border-border">
                  {yearGroups.map((yg) => (
                    <Pressable
                      key={yg.value}
                      onPress={() => handleChangeYearGroup(yg.value)}
                      className={`flex-row items-center gap-3 p-2 rounded-lg ${
                        state.userProfile.yearGroup === yg.value
                          ? "bg-primary/10"
                          : ""
                      }`}
                    >
                      <Text className="text-xl">{yg.emoji}</Text>
                      <Text className={`flex-1 font-semibold ${
                        state.userProfile.yearGroup === yg.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}>
                        {yg.label}
                      </Text>
                      {state.userProfile.yearGroup === yg.value && (
                        <Text className="text-primary font-bold">✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
              {state.userProfile.targetSchool && (
                <>
                  <View className="h-px bg-border" />
                  <View className="gap-1">
                    <Text className="text-sm text-muted">Target School</Text>
                    <Text className="text-lg font-semibold text-foreground">
                      {state.userProfile.targetSchool}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Preferences
            </Text>

            {/* Notifications */}
            <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between border border-border">
              <View className="gap-1 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Notifications
                </Text>
                <Text className="text-sm text-muted">
                  Daily practice reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            </View>

            {/* Dark Mode */}
            <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between border border-border">
              <View className="gap-1 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Dark Mode
                </Text>
                <Text className="text-sm text-muted">
                  Easier on the eyes
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleToggleDarkMode}
              />
            </View>
          </View>

          {/* Statistics Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Statistics
            </Text>
            <View className="bg-primary/10 rounded-xl p-4 gap-3 border border-primary/20">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Total Points</Text>
                <Text className="text-lg font-bold text-primary">
                  {state.totalPointsEarned}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Current Streak</Text>
                <Text className="text-lg font-bold text-accent">
                  {state.currentStreak} days 🔥
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Longest Streak</Text>
                <Text className="text-lg font-bold text-success">
                  {state.longestStreak} days
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Total Sessions</Text>
                <Text className="text-lg font-bold text-foreground">
                  {state.practiceSessions.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-error">
              Danger Zone
            </Text>
            <Pressable
              onPress={handleResetProgress}
              className="bg-error/10 rounded-xl p-4 border border-error/20 items-center"
            >
              <Text className="text-error font-semibold">
                Reset All Progress
              </Text>
            </Pressable>
          </View>

          {/* About Section */}
          <View className="bg-surface rounded-xl p-4 gap-2 border border-border">
            <Text className="text-sm font-semibold text-foreground">
              📚 About Study Buddy
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Study Buddy helps Year 3-6 pupils prepare for selective grammar schools through daily practice, progressive mastery, and confidence-building exercises.
            </Text>
            <Text className="text-xs text-muted mt-2">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
