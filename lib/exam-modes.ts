/**
 * Exam Modes Implementation
 * GL Style (QE/Sutton) vs Tiffin Style (Stage 2)
 */

import { Question, QuestionType } from "./types";

export type ExamMode = "gl-style" | "tiffin-style";

/**
 * GL Style characteristics:
 * - Multiple choice focus
 * - High speed emphasis
 * - 30-45 seconds per question
 * - Cloze tests (words and characters)
 * - Odd one out
 * - Synonyms/Antonyms
 */
export const GL_STYLE_CONFIG = {
  name: "GL Style (QE/Sutton)",
  description: "Multiple choice focus with high speed emphasis",
  timePerQuestion: 45, // seconds
  questionTypes: ["multiple-choice", "cloze-word", "cloze-character", "odd-one-out"],
  focusAreas: ["Speed", "Accuracy", "Pattern Recognition"],
  icon: "⚡",
};

/**
 * Tiffin Style characteristics:
 * - Typed answers
 * - Multi-step working
 * - Show your working
 * - Longer time per question
 * - Comprehension with written answers
 * - Problem solving with explanation
 */
export const TIFFIN_STYLE_CONFIG = {
  name: "Tiffin Style (Stage 2)",
  description: "Typed answers with multi-step working and explanations",
  timePerQuestion: 120, // seconds
  questionTypes: ["text-input", "multi-step", "comprehension-written", "problem-solving"],
  focusAreas: ["Working", "Explanation", "Problem Solving"],
  icon: "📝",
};

/**
 * Extended Question with additional properties
 */
export interface ExtendedQuestion extends Question {
  workingRequired?: boolean;
  keywordsToCheck?: string[]; // For answer validation
}

/**
 * Create GL Style question (Cloze - Words)
 */
export function createClozeWordQuestion(
  passage: string,
  missingWords: string[],
  options: string[],
  correctAnswers: string[]
): Question {
  return {
    id: `cloze-word-${Date.now()}`,
    subject: "english",
    level: "intermediate",
    yearGroup: "year-5",
    type: "cloze-word",
    question: passage,
    options,
    correctAnswer: correctAnswers[0],
    explanation: `The correct word is "${correctAnswers[0]}" because it fits the context and meaning of the passage.`,
    curriculumReference: "UK Year 5 English: Cloze Tests (GL Assessment)",
  };
}

/**
 * Create GL Style question (Cloze - Characters)
 */
export function createClozeCharacterQuestion(
  passage: string,
  correctAnswer: string
): Question {
  return {
    id: `cloze-char-${Date.now()}`,
    subject: "english",
    level: "intermediate",
    yearGroup: "year-5",
    type: "cloze-character",
    question: passage,
    correctAnswer,
    explanation: `The missing letters spell "${correctAnswer}". Look at the context and the pattern of letters.`,
    curriculumReference: "UK Year 5 English: Character Cloze Tests",
  };
}

/**
 * Create GL Style question (Odd One Out)
 */
export function createOddOneOutQuestion(
  options: string[],
  correctAnswer: string,
  reason: string
): Question {
  return {
    id: `odd-one-out-${Date.now()}`,
    subject: "reasoning",
    level: "intermediate",
    yearGroup: "year-5",
    type: "odd-one-out",
    question: `Which word is the odd one out? ${options.join(", ")}`,
    options,
    correctAnswer,
    explanation: `"${correctAnswer}" is the odd one out because ${reason}`,
    curriculumReference: "UK Year 5 Reasoning: Odd One Out",
  };
}

/**
 * Create Tiffin Style question (Text Input with Working)
 */
export function createTextInputQuestion(
  question: string,
  correctAnswer: string,
  keywordsToCheck?: string[]
): ExtendedQuestion {
  return {
    id: `text-input-${Date.now()}`,
    subject: "maths",
    level: "advanced",
    yearGroup: "year-5",
    type: "text-input",
    question,
    correctAnswer,
    workingRequired: true,
    explanation: `The answer is "${correctAnswer}". Show your working step by step.`,
    curriculumReference: "UK Year 5 Maths: Problem Solving with Working",
  };
}

/**
 * Create Tiffin Style question (Multi-step Problem)
 */
export function createMultiStepQuestion(
  question: string,
  correctAnswer: string,
  steps: string[],
  keywordsToCheck: string[]
): ExtendedQuestion {
  return {
    id: `multi-step-${Date.now()}`,
    subject: "maths",
    level: "advanced",
    yearGroup: "year-5",
    type: "multi-step",
    question,
    correctAnswer,
    workingRequired: true,
    keywordsToCheck,
    explanation: `Solution steps: ${steps.join(" → ")}. Final answer: ${correctAnswer}`,
    curriculumReference: "UK Year 5 Maths: Multi-step Problem Solving",
  };
}

/**
 * Create Tiffin Style question (Comprehension with Written Answer)
 */
export function createComprehensionWrittenQuestion(
  passage: string,
  question: string,
  correctAnswer: string,
  keywordsToCheck: string[]
): ExtendedQuestion {
  return {
    id: `comp-written-${Date.now()}`,
    subject: "english",
    level: "advanced",
    yearGroup: "year-5",
    type: "comprehension-written",
    question: `${passage}\n\nQuestion: ${question}`,
    correctAnswer,
    keywordsToCheck,
    explanation: `A good answer should include: ${keywordsToCheck.join(", ")}`,
    curriculumReference: "UK Year 5 English: Comprehension with Written Response",
  };
}

/**
 * Validate GL Style answer (exact match for multiple choice)
 */
export function validateGLStyleAnswer(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

/**
 * Validate Tiffin Style answer (keyword checking)
 */
export function validateTiffinStyleAnswer(
  userAnswer: string,
  correctAnswer: string,
  keywordsToCheck?: string[]
): { correct: boolean; score: number; feedback: string } {
  const userLower = userAnswer.toLowerCase();
  const correctLower = correctAnswer.toLowerCase();

  // Exact match
  if (userLower === correctLower) {
    return {
      correct: true,
      score: 100,
      feedback: "Perfect answer!",
    };
  }

  // Keyword checking
  if (keywordsToCheck && keywordsToCheck.length > 0) {
    const foundKeywords = keywordsToCheck.filter((keyword) =>
      userLower.includes(keyword.toLowerCase())
    );
    const keywordScore = Math.round(
      (foundKeywords.length / keywordsToCheck.length) * 100
    );

    if (keywordScore >= 80) {
      return {
        correct: true,
        score: keywordScore,
        feedback: `Good answer! You included ${foundKeywords.length}/${keywordsToCheck.length} key points.`,
      };
    }

    if (keywordScore >= 50) {
      return {
        correct: false,
        score: keywordScore,
        feedback: `Partial credit. You included ${foundKeywords.length}/${keywordsToCheck.length} key points. Missing: ${keywordsToCheck
          .filter((k) => !foundKeywords.includes(k))
          .join(", ")}`,
      };
    }
  }

  return {
    correct: false,
    score: 0,
    feedback: `Not quite right. The answer should be: ${correctAnswer}`,
  };
}

/**
 * Get exam mode config
 */
export function getExamModeConfig(mode: ExamMode) {
  return mode === "gl-style" ? GL_STYLE_CONFIG : TIFFIN_STYLE_CONFIG;
}

/**
 * Get time limit for exam mode
 */
export function getTimeLimit(mode: ExamMode): number {
  return mode === "gl-style"
    ? GL_STYLE_CONFIG.timePerQuestion
    : TIFFIN_STYLE_CONFIG.timePerQuestion;
}
