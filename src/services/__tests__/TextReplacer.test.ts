import { describe, test, expect } from "vitest";
import { TextReplacer } from "../TextReplacer";
import type { CharacterMapping } from "../../types";

const mockCharacters: CharacterMapping[] = [
  { id: "ka_a", character: "ア", romanizations: ["a"], pronunciation: "ah" },
  { id: "ka_i", character: "イ", romanizations: ["i"], pronunciation: "ee" },
  {
    id: "ka_ka",
    character: "カ",
    romanizations: ["ka", "ca"],
    pronunciation: "kah",
  },
  {
    id: "ka_chi",
    character: "チ",
    romanizations: ["chi"],
    pronunciation: "chee",
  },
];

describe("TextReplacer", () => {
  test("should replace single characters correctly", () => {
    const result = TextReplacer.replaceText("I have a cat", [
      mockCharacters[0],
    ]);
    expect(result).toBe("I hアve ア cアt"); // All 'a' characters get replaced, including within words
  });

  test("should handle multiple romanizations per character", () => {
    const result = TextReplacer.replaceText("I can eat cake", [
      mockCharacters[2],
    ]);
    expect(result).toBe("I カn eat カke"); // 'ca' gets replaced with 'カ'
  });

  test("should prioritize longer romanizations", () => {
    const result = TextReplacer.replaceText("The chicken is here", [
      mockCharacters[3],
    ]);
    expect(result).toBe("The チcken is here"); // 'chi' gets replaced with 'チ'
  });

  test("should be case insensitive", () => {
    const result = TextReplacer.replaceText("A big Apple", [mockCharacters[0]]);
    expect(result).toBe("ア big アpple"); // Both 'A' and 'A' in 'Apple' get replaced
  });

  test("should handle multiple characters", () => {
    const result = TextReplacer.replaceText("I have a big cat", [
      mockCharacters[0],
      mockCharacters[1],
    ]);
    expect(result).toBe("イ hアve ア bイg cアt"); // All instances of 'I', 'a', and 'i' get replaced
  });

  test("should handle edge cases with punctuation", () => {
    const result = TextReplacer.replaceText("Hello, I am happy!", [
      mockCharacters[0],
      mockCharacters[1],
    ]);
    expect(result).toBe("Hello, イ アm hアppy!"); // 'I', 'a' in 'am', and 'a' in 'happy' get replaced
  });

  test("should check if sentence contains target romanizations", () => {
    expect(TextReplacer.hasTargetRomanizations("I have a cat", ["a"])).toBe(
      true
    );
    expect(TextReplacer.hasTargetRomanizations("I have a cat", ["x"])).toBe(
      false
    );
    expect(TextReplacer.hasTargetRomanizations("I can do it", ["ca"])).toBe(
      true
    ); // 'ca' in 'can'
    expect(TextReplacer.hasTargetRomanizations("Apple pie", ["a"])).toBe(true); // 'a' in 'Apple'
  });
});
