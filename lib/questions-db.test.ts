import { describe, it, expect } from "vitest";
import {
  getRandomQuestions,
  getQuestionsByLevel,
  getAllSubjects,
} from "./questions-db";
import { Subject, Level } from "./types";

describe("Questions Database - 11+ Exam Content", () => {
  const subjects: Subject[] = ["english", "maths", "science", "reasoning"];
  const levels: Level[] = ["foundation", "intermediate", "advanced", "expert"];

  describe("Question Structure", () => {
    it("should have all required subjects", () => {
      const allSubjects = getAllSubjects();
      expect(allSubjects).toEqual(["english", "maths", "science", "reasoning"]);
    });

    it("should have questions for all levels in each subject", () => {
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          expect(questions.length).toBeGreaterThan(0);
          expect(questions.length).toBeLessThanOrEqual(5);
        });
      });
    });

    it("should have correct question structure with all required fields", () => {
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          questions.forEach((q) => {
            expect(q).toHaveProperty("id");
            expect(q).toHaveProperty("subject");
            expect(q).toHaveProperty("level");
            expect(q).toHaveProperty("type");
            expect(q).toHaveProperty("question");
            expect(q).toHaveProperty("correctAnswer");
            expect(q).toHaveProperty("explanation");
            expect(q.subject).toBe(subject);
            expect(q.level).toBe(level);
          });
        });
      });
    });

    it("should have multiple-choice questions with options", () => {
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          questions.forEach((q) => {
            if (q.type === "multiple-choice") {
              expect(q.options).toBeDefined();
              expect(Array.isArray(q.options)).toBe(true);
              expect(q.options!.length).toBeGreaterThanOrEqual(3);
              expect(q.options!.includes(q.correctAnswer as string)).toBe(true);
            }
          });
        });
      });
    });
  });

  describe("11+ Exam Alignment", () => {
    it("should have Foundation level with 5 questions per subject", () => {
      subjects.forEach((subject) => {
        const questions = getQuestionsByLevel(subject, "foundation");
        expect(questions.length).toBe(5);
      });
    });

    it("should have Intermediate level with 5 questions per subject", () => {
      subjects.forEach((subject) => {
        const questions = getQuestionsByLevel(subject, "intermediate");
        expect(questions.length).toBe(5);
      });
    });

    it("should have Advanced level with 5 questions per subject", () => {
      subjects.forEach((subject) => {
        const questions = getQuestionsByLevel(subject, "advanced");
        expect(questions.length).toBe(5);
      });
    });

    it("should have Expert level with 5 questions per subject", () => {
      subjects.forEach((subject) => {
        const questions = getQuestionsByLevel(subject, "expert");
        expect(questions.length).toBe(5);
      });
    });

    it("should have all four levels available for each subject", () => {
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          expect(questions.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Subject Coverage", () => {
    it("should have English questions covering vocabulary and grammar", () => {
      const questions = getQuestionsByLevel("english", "foundation");
      const englishKeywords = questions.some(
        (q) =>
          q.question.toLowerCase().includes("word") ||
          q.question.toLowerCase().includes("spell") ||
          q.question.toLowerCase().includes("grammar") ||
          q.question.toLowerCase().includes("sentence")
      );
      expect(englishKeywords).toBe(true);
    });

    it("should have Maths questions covering arithmetic and problem-solving", () => {
      const questions = getQuestionsByLevel("maths", "foundation");
      const mathsKeywords = questions.some(
        (q) =>
          q.question.includes("+") ||
          q.question.includes("-") ||
          q.question.includes("×") ||
          q.question.includes("÷") ||
          q.question.toLowerCase().includes("fraction") ||
          q.question.toLowerCase().includes("percent")
      );
      expect(mathsKeywords).toBe(true);
    });

    it("should have Science questions covering biology and physics", () => {
      const questions = getQuestionsByLevel("science", "foundation");
      const scienceKeywords = questions.some(
        (q) =>
          q.question.toLowerCase().includes("organism") ||
          q.question.toLowerCase().includes("matter") ||
          q.question.toLowerCase().includes("plant") ||
          q.question.toLowerCase().includes("animal") ||
          q.question.toLowerCase().includes("energy")
      );
      expect(scienceKeywords).toBe(true);
    });

    it("should have Reasoning questions covering logic and patterns", () => {
      const questions = getQuestionsByLevel("reasoning", "foundation");
      const reasoningKeywords = questions.some(
        (q) =>
          q.question.toLowerCase().includes("pattern") ||
          q.question.toLowerCase().includes("number") ||
          q.question.toLowerCase().includes("shape") ||
          q.question.toLowerCase().includes("logic") ||
          q.question.toLowerCase().includes("analogy")
      );
      expect(reasoningKeywords).toBe(true);
    });
  });

  describe("Random Question Selection", () => {
    it("should return requested number of random questions", () => {
      const questions = getRandomQuestions("english", "foundation", 3);
      expect(questions.length).toBe(3);
    });

    it("should not exceed available questions", () => {
      const questions = getRandomQuestions("english", "foundation", 100);
      expect(questions.length).toBeLessThanOrEqual(5);
    });

    it("should return valid questions from correct subject and level", () => {
      const questions = getRandomQuestions("maths", "intermediate", 5);
      questions.forEach((q) => {
        expect(q.subject).toBe("maths");
        expect(q.level).toBe("intermediate");
      });
    });
  });

  describe("Content Quality", () => {
    it("should have non-empty explanations for all questions", () => {
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          questions.forEach((q) => {
            expect(q.explanation).toBeDefined();
            expect(q.explanation.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it("should have unique question IDs", () => {
      const allQuestions: string[] = [];
      subjects.forEach((subject) => {
        levels.forEach((level) => {
          const questions = getQuestionsByLevel(subject, level);
          questions.forEach((q) => {
            allQuestions.push(q.id);
          });
        });
      });

      const uniqueIds = new Set(allQuestions);
      expect(uniqueIds.size).toBe(allQuestions.length);
    });

    it("should have questions appropriate for 11+ exam preparation", () => {
      // Expert level should contain more complex content
      const expertQuestions = getQuestionsByLevel("english", "expert");
      expect(expertQuestions.length).toBeGreaterThan(0);

      // Verify expert questions exist and have content
      expertQuestions.forEach((q) => {
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.explanation.length).toBeGreaterThan(0);
      });
    });
  });
});
