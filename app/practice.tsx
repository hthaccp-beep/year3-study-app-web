/**
 * Practice Session Screen - Main practice interface with timed mode
 */

import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state-context";
import { getRandomQuestions } from "@/lib/questions-db";
import { Question, Subject, Level, PracticeSession, TIME_LIMITS } from "@/lib/types";
import * as Haptics from "expo-haptics";

const QUESTIONS_PER_LEVEL: Record<Level, number> = {
  foundation: 5,
  intermediate: 7,
  advanced: 10,
  expert: 12,
};

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, recordPracticeSession } = useAppState();
  const subject = (params.subject as Subject) || "english";
  const selectedLevel = (params.level as Level) || "foundation";
  const timedMode = params.timed === "true";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timesPerQuestion, setTimesPerQuestion] = useState<number[]>([]);

  useEffect(() => {
    const progress = state.subjectProgress[subject];
    const level = progress.currentLevel;
    const count = QUESTIONS_PER_LEVEL[level];

    const fetchedQuestions = getRandomQuestions(subject, level, count);
    setQuestions(fetchedQuestions);
    setAnswers(new Array(fetchedQuestions.length).fill(null));
    setTimesPerQuestion(new Array(fetchedQuestions.length).fill(0));
    
    if (timedMode) {
      setTimeRemaining(TIME_LIMITS[level]);
      setQuestionStartTime(Date.now());
    }
    
    setIsLoading(false);
  }, [subject, state.subjectProgress, timedMode]);

  // Timer countdown effect
  useEffect(() => {
    if (!timedMode || showFeedback || isLoading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timedMode, showFeedback, isLoading, questions.length]);

  const handleTimeUp = () => {
    if (!selectedAnswer && !showFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowFeedback(true);
      setIsCorrect(false);
      
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = null;
      setAnswers(newAnswers);
    }
  };

  if (isLoading || questions.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-foreground">Loading questions...</Text>
      </ScreenContainer>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = state.subjectProgress[subject];
  const timeWarning = timedMode && timeRemaining <= 20;
  const timeCritical = timedMode && timeRemaining <= 10;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      Alert.alert("Please select an answer");
      return;
    }

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Record time for this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const newTimes = [...timesPerQuestion];
    newTimes[currentQuestionIndex] = timeSpent;
    setTimesPerQuestion(newTimes);

    Haptics.impactAsync(
      correct
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
      
      if (timedMode) {
        setTimeRemaining(TIME_LIMITS[selectedLevel]);
      }
    } else {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = async () => {
    const correctCount = answers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const totalTimeTaken = Math.round((Date.now() - sessionStartTime) / 1000);
    const pointsEarned = correctCount * 10;
    const averageTimePerQuestion = Math.round(totalTimeTaken / questions.length);

    const session: PracticeSession = {
      id: `session-${Date.now()}`,
      subject,
      level: selectedLevel,
      date: new Date().toISOString(),
      questionsAnswered: questions.length,
      correctAnswers: correctCount,
      accuracy,
      pointsEarned,
      timeTakenSeconds: totalTimeTaken,
      timedMode,
      averageTimePerQuestion,
      speedScore: timedMode ? calculateSpeedScore(averageTimePerQuestion, selectedLevel) : undefined,
    };

    try {
      await recordPracticeSession(session);
      router.navigate({
        pathname: "/session-complete",
        params: {
          correctCount,
          totalQuestions: questions.length,
          accuracy,
          points: pointsEarned,
          subject,
          timedMode: timedMode ? "true" : "false",
          averageTime: averageTimePerQuestion,
          speedScore: session.speedScore,
        },
      } as any);
    } catch (error) {
      Alert.alert("Error", "Failed to save session. Please try again.");
      console.error(error);
    }
  };

  const calculateSpeedScore = (avgTime: number, level: Level): number => {
    const timeLimit = TIME_LIMITS[level];
    const efficiency = Math.max(0, (timeLimit - avgTime) / timeLimit);
    return Math.round(efficiency * 100);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground capitalize">
                {subject}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-muted capitalize">
                  {progress.currentLevel}
                </Text>
                {timedMode && (
                  <View className={`px-3 py-1 rounded-full ${
                    timeCritical ? "bg-error/20" : timeWarning ? "bg-warning/20" : "bg-primary/20"
                  }`}>
                    <Text className={`text-sm font-bold ${
                      timeCritical ? "text-error" : timeWarning ? "text-warning" : "text-primary"
                    }`}>
                      {formatTime(timeRemaining)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text className="text-sm text-muted">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row gap-1">
            {questions.map((_, index) => (
              <View
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= currentQuestionIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </View>

          {/* Question */}
          <View className="bg-surface rounded-xl p-4 gap-4">
            <Text className="text-lg font-semibold text-foreground leading-relaxed">
              {currentQuestion.question}
            </Text>

            {/* Answer Options */}
            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <View className="gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Pressable
                    key={index}
                    onPress={() => !showFeedback && handleAnswerSelect(option)}
                    disabled={showFeedback}
                    className={`p-3 rounded-lg border-2 ${
                      selectedAnswer === option
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border"
                    } ${showFeedback ? "opacity-50" : ""}`}
                  >
                    <Text className="text-base text-foreground">{option}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Detailed Feedback with Explanation */}
            {showFeedback && (
              <View
                className={`p-4 rounded-lg gap-3 ${
                  isCorrect ? "bg-success/10" : "bg-warning/10"
                }`}
              >
                <View>
                  <Text
                    className={`text-base font-semibold ${
                      isCorrect ? "text-success" : "text-warning"
                    }`}
                  >
                    {isCorrect ? "✓ Correct!" : "✗ Not quite right"}
                  </Text>
                </View>

                {/* Correct Answer */}
                <View className="gap-1">
                  <Text className="text-xs font-semibold text-muted uppercase">
                    Correct Answer
                  </Text>
                  <View className="bg-background/50 rounded-lg p-2">
                    <Text className="text-base font-semibold text-foreground">
                      {currentQuestion.correctAnswer}
                    </Text>
                  </View>
                </View>

                {/* Explanation */}
                <View className="gap-1">
                  <Text className="text-xs font-semibold text-muted uppercase">
                    Why?
                  </Text>
                  <Text className="text-sm text-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </Text>
                </View>

                {/* Curriculum Reference */}
                {currentQuestion.curriculumReference && (
                  <View className="gap-1 pt-2 border-t border-foreground/10">
                    <Text className="text-xs font-semibold text-muted uppercase">
                      Curriculum
                    </Text>
                    <Text className="text-xs text-foreground italic">
                      {currentQuestion.curriculumReference}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Buttons */}
          <View className="gap-3">
            {!showFeedback ? (
              <Pressable
                onPress={handleSubmitAnswer}
                className="bg-primary py-3 rounded-lg items-center"
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-white font-semibold text-base">
                  Submit Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                className="bg-primary py-3 rounded-lg items-center"
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-white font-semibold text-base">
                  {currentQuestionIndex < questions.length - 1
                    ? "Next Question"
                    : "See Results"}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              className="py-3 rounded-lg items-center border border-border"
            >
              <Text className="text-foreground font-semibold text-base">
                Exit Practice
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
