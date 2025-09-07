import { describe, test, expect } from "vitest";
import { ContentGenerator } from "../ContentGenerator";

describe("ContentGenerator", () => {
  const generator = new ContentGenerator();

  test("should validate content items correctly", () => {
    const sentenceItem = {
      id: "test-sentence",
      type: "sentence" as const,
      displayText: "Hello world",
      originalText: "Hello world",
    };

    const questionItem = {
      id: "test-question",
      type: "question" as const,
      displayText: "ア",
      acceptedAnswers: ["a"],
      characterId: "ka_a",
      difficulty: 1,
    };

    // Test sentence validation
    const sentenceResult = generator.validateContentItem(
      sentenceItem,
      "Hello world",
    );
    expect(sentenceResult.isCorrect).toBe(true);

    const wrongSentenceResult = generator.validateContentItem(
      sentenceItem,
      "Wrong answer",
    );
    expect(wrongSentenceResult.isCorrect).toBe(false);

    // Test question validation
    const questionResult = generator.validateContentItem(questionItem, "a");
    expect(questionResult.isCorrect).toBe(true);

    const wrongQuestionResult = generator.validateContentItem(
      questionItem,
      "b",
    );
    expect(wrongQuestionResult.isCorrect).toBe(false);
  });

  test("should verify triangular calculation method directly", () => {
    // Test the calculateQuestionsPerLevel method directly
    const testCases = [
      { level: 0, expected: 2 },
      { level: 1, expected: 3 },
      { level: 2, expected: 3 },
      { level: 3, expected: 4 },
      { level: 4, expected: 4 },
      { level: 5, expected: 4 },
      { level: 6, expected: 5 },
      { level: 7, expected: 5 },
      { level: 10, expected: 6 },
    ];

    testCases.forEach(({ level, expected }) => {
      const actual = generator.calculateQuestionsPerLevel(level);
      expect(actual).toBe(expected);
    });
  });
});
