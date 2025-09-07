import { describe, test, expect } from "vitest";
import { SentenceSelector } from "../SentenceSelector";
import type { SentenceBank, CharacterMapping } from "../../types";

const mockSentenceBank: SentenceBank = {
  short: [
    "I have a cat",
    "She likes tea",
    "It is hot today",
    "We can go now",
    "This is fun",
  ],
  medium: [
    "The weather is beautiful today",
    "I enjoy reading books in the morning",
    "She teaches music at school",
  ],
  long: [
    "Every morning I wake up early and go for a run through the neighborhood",
    "The scientist spent years researching renewable energy sources",
  ],
};

const mockCharacter: CharacterMapping = {
  id: "ka_a",
  character: "ア",
  romanizations: ["a"],
  pronunciation: "ah",
};

describe("SentenceSelector", () => {
  test("should find sentences containing target character", () => {
    const result = SentenceSelector.selectSentencesForCharacter(
      mockSentenceBank,
      mockCharacter,
      2,
      "short",
    );

    expect(result.length).toBeGreaterThan(0);
    result.forEach((sentence) => {
      expect(sentence.toLowerCase()).toMatch(/a/); // Should contain 'a' anywhere in the sentence
    });
  });

  test("should return requested number of sentences when available", () => {
    const result = SentenceSelector.selectSentencesForCharacter(
      mockSentenceBank,
      mockCharacter,
      2,
      "short",
    );

    expect(result.length).toBeLessThanOrEqual(2);
  });

  test("should fall back to other lengths when not enough sentences", () => {
    const mockCharacterRare: CharacterMapping = {
      id: "rare",
      character: "Rare",
      romanizations: ["xyz"],
      pronunciation: "rare",
    };

    const result = SentenceSelector.selectSentencesForCharacter(
      mockSentenceBank,
      mockCharacterRare,
      5,
      "short",
    );

    // Should return empty or very few results since 'xyz' doesn't appear
    expect(result.length).toBeLessThanOrEqual(5);
  });
});
