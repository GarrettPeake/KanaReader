import { describe, test, expect } from "vitest";
import { SENTENCE_BANK } from "../sentenceBank";
import {
  JLPT_N5_KANJI,
  JLPT_N4_1_KANJI,
  JLPT_N4_2_KANJI,
  JLPT_N3_1_KANJI,
  JLPT_N3_2_KANJI,
  JLPT_N3_3_KANJI,
  JLPT_N3_4_KANJI,
  JLPT_N2_1_KANJI,
  JLPT_N2_2_KANJI,
  JLPT_N2_3_KANJI,
  JLPT_N2_4_KANJI,
  JLPT_N1_1_KANJI,
  JLPT_N1_2_KANJI,
  JLPT_N1_3_KANJI,
  JLPT_N1_4_KANJI,
  JLPT_N1_5_KANJI,
  JLPT_N1_6_KANJI,
  JLPT_N1_7_KANJI,
  JLPT_N1_8_KANJI,
  JLPT_N1_9_KANJI,
  JLPT_N1_10_KANJI,
  JLPT_N1_11_KANJI,
  JLPT_N1_12_KANJI,
} from "../jlptKanjiMappings";
import { SentenceSelector } from "../../services/SentenceSelector";
import type { CharacterMapping } from "../../types";

// Combine all JLPT character mappings
const ALL_JLPT_CHARACTERS: CharacterMapping[] = [
  ...JLPT_N5_KANJI,
  ...JLPT_N4_1_KANJI,
  ...JLPT_N4_2_KANJI,
  ...JLPT_N3_1_KANJI,
  ...JLPT_N3_2_KANJI,
  ...JLPT_N3_3_KANJI,
  ...JLPT_N3_4_KANJI,
  ...JLPT_N2_1_KANJI,
  ...JLPT_N2_2_KANJI,
  ...JLPT_N2_3_KANJI,
  ...JLPT_N2_4_KANJI,
  ...JLPT_N1_1_KANJI,
  ...JLPT_N1_2_KANJI,
  ...JLPT_N1_3_KANJI,
  ...JLPT_N1_4_KANJI,
  ...JLPT_N1_5_KANJI,
  ...JLPT_N1_6_KANJI,
  ...JLPT_N1_7_KANJI,
  ...JLPT_N1_8_KANJI,
  ...JLPT_N1_9_KANJI,
  ...JLPT_N1_10_KANJI,
  ...JLPT_N1_11_KANJI,
  ...JLPT_N1_12_KANJI,
];

describe("Sentence Bank Coverage", () => {
  test("should have the expected number of sentences after expansion", () => {
    // Verify we have the base sentences plus our additions
    expect(SENTENCE_BANK.short.length).toBeGreaterThanOrEqual(870 + 500); // Original + our 500 additions
    expect(SENTENCE_BANK.medium.length).toBeGreaterThanOrEqual(30 + 100); // Original + our 100 additions
    expect(SENTENCE_BANK.long.length).toBeGreaterThanOrEqual(10 + 40); // Original + our 40 additions
  });

  test("should provide at least 2 sentences for each character mapping", () => {
    const failedCharacters: Array<{
      character: CharacterMapping;
      availableSentences: number;
    }> = [];

    // Check each character mapping using the actual SentenceSelector logic
    for (const character of ALL_JLPT_CHARACTERS) {
      // Try to find sentences for this character using SentenceSelector
      const availableSentences = SentenceSelector.selectSentencesForCharacter(
        SENTENCE_BANK,
        character,
        10, // Request more than 2 to see how many are actually available
        "short"
      );

      if (availableSentences.length < 2) {
        failedCharacters.push({
          character,
          availableSentences: availableSentences.length,
        });
      }
    }

    // Report any characters that don't have enough sentences
    if (failedCharacters.length > 0) {
      console.error("Failed characters:");
      failedCharacters.forEach(({ character, availableSentences }) => {
        console.error(
          `${character.character} => ${character.translations!.join(
            ", "
          )} ${availableSentences}/2`
        );
      });
    }

    // All characters should have at least 2 sentences available
    expect(failedCharacters.length).toBe(0);
  }, 10000);

  test("should efficiently use sentences that cover multiple translations", () => {
    // Count how many translations each sentence covers
    const sentenceUtilization: Array<{
      sentence: string;
      translationCount: number;
    }> = [];

    // Check a sample of sentences to see how many translations they cover
    const sampleSentences = [
      ...SENTENCE_BANK.short.slice(-100), // Check last 100 short sentences (our additions)
      ...SENTENCE_BANK.medium.slice(-20), // Check last 20 medium sentences
      ...SENTENCE_BANK.long.slice(-10), // Check last 10 long sentences
    ];

    for (const sentence of sampleSentences) {
      let translationCount = 0;
      const uniqueTranslations = new Set<string>();

      // Get all unique translations from all characters
      for (const character of ALL_JLPT_CHARACTERS) {
        for (const translation of character.translations!) {
          uniqueTranslations.add(translation);
        }
      }

      // Check how many translations this sentence could serve
      for (const translation of uniqueTranslations) {
        const mockCharacter: CharacterMapping = {
          id: `test_${translation}`,
          character: "テ",
          romanizations: [translation.toLowerCase().replace(/\s+/g, "")],
          pronunciation: "test",
          translations: [translation],
        };

        const foundSentences = SentenceSelector.selectSentencesForCharacter(
          { short: [sentence], medium: [], long: [] },
          mockCharacter,
          1,
          "short"
        );

        if (foundSentences.length > 0) {
          translationCount++;
        }
      }

      if (translationCount > 0) {
        sentenceUtilization.push({ sentence, translationCount });
      }
    }

    // Check that we have efficiently designed sentences
    const averageUtilization =
      sentenceUtilization.reduce(
        (sum, item) => sum + item.translationCount,
        0
      ) / sentenceUtilization.length;

    console.log(
      `Average translations per sentence: ${averageUtilization.toFixed(2)}`
    );
    console.log(`Most efficient sentences:`);
    sentenceUtilization
      .sort((a, b) => b.translationCount - a.translationCount)
      .slice(0, 5)
      .forEach(({ sentence, translationCount }) => {
        console.log(
          `  - "${sentence.substring(
            0,
            50
          )}..." covers ${translationCount} translations`
        );
      });

    // We should have decent utilization (each sentence covering multiple translations)
    expect(averageUtilization).toBeGreaterThan(1); // Each sentence should cover at least 1 translation on average
  });

  test("should provide balanced coverage across different sentence lengths", () => {
    const coverageByLength = {
      short: new Set<string>(),
      medium: new Set<string>(),
      long: new Set<string>(),
    };

    // Get all unique translations
    const allTranslations = new Set<string>();
    for (const character of ALL_JLPT_CHARACTERS) {
      for (const translation of character.translations!) {
        allTranslations.add(translation);
      }
    }

    // Check coverage for each sentence length
    for (const translation of allTranslations) {
      const mockCharacter: CharacterMapping = {
        id: `test_${translation}`,
        character: "テ",
        romanizations: [translation.toLowerCase().replace(/\s+/g, "")],
        pronunciation: "test",
        translations: [translation],
      };

      // Check each length category
      for (const length of ["short", "medium", "long"] as const) {
        const sentences = SentenceSelector.selectSentencesForCharacter(
          SENTENCE_BANK,
          mockCharacter,
          1,
          length
        );

        if (sentences.length > 0) {
          coverageByLength[length].add(translation);
        }
      }
    }

    console.log(`Coverage by sentence length:`);
    console.log(`  Short: ${coverageByLength.short.size} translations`);
    console.log(`  Medium: ${coverageByLength.medium.size} translations`);
    console.log(`  Long: ${coverageByLength.long.size} translations`);

    // Short sentences should provide the broadest coverage
    expect(coverageByLength.short.size).toBeGreaterThanOrEqual(
      coverageByLength.medium.size
    );
    expect(coverageByLength.short.size).toBeGreaterThanOrEqual(
      coverageByLength.long.size
    );

    // But medium and long should also provide reasonable coverage
    expect(coverageByLength.medium.size).toBeGreaterThan(
      allTranslations.size * 0.3
    ); // At least 30% coverage
    expect(coverageByLength.long.size).toBeGreaterThan(
      allTranslations.size * 0.2
    ); // At least 20% coverage
  });

  test("should have reasonable uniqueness within each category", () => {
    // Check for duplicate sentences within each category
    const shortSentenceSet = new Set(SENTENCE_BANK.short);
    const mediumSentenceSet = new Set(SENTENCE_BANK.medium);
    const longSentenceSet = new Set(SENTENCE_BANK.long);

    // Allow some duplicates since we added many targeted sentences for coverage
    // Expect at least 95% uniqueness
    expect(shortSentenceSet.size / SENTENCE_BANK.short.length).toBeGreaterThan(
      0.95
    );
    expect(mediumSentenceSet.size).toBe(SENTENCE_BANK.medium.length);
    expect(longSentenceSet.size).toBe(SENTENCE_BANK.long.length);

    console.log(
      `Short sentences: ${SENTENCE_BANK.short.length} total, ${
        shortSentenceSet.size
      } unique (${(
        (shortSentenceSet.size / SENTENCE_BANK.short.length) *
        100
      ).toFixed(1)}% unique)`
    );
    console.log(
      `Medium sentences: ${SENTENCE_BANK.medium.length} total, ${
        mediumSentenceSet.size
      } unique (${(
        (mediumSentenceSet.size / SENTENCE_BANK.medium.length) *
        100
      ).toFixed(1)}% unique)`
    );
    console.log(
      `Long sentences: ${SENTENCE_BANK.long.length} total, ${
        longSentenceSet.size
      } unique (${(
        (longSentenceSet.size / SENTENCE_BANK.long.length) *
        100
      ).toFixed(1)}% unique)`
    );
  });

  test("should contain sentences with appropriate length for each category", () => {
    // Check that sentences are appropriately categorized by length
    const shortLengths = SENTENCE_BANK.short.map((s) => s.length);
    const mediumLengths = SENTENCE_BANK.medium.map((s) => s.length);
    const longLengths = SENTENCE_BANK.long.map((s) => s.length);

    const avgShort =
      shortLengths.reduce((a, b) => a + b, 0) / shortLengths.length;
    const avgMedium =
      mediumLengths.reduce((a, b) => a + b, 0) / mediumLengths.length;
    const avgLong = longLengths.reduce((a, b) => a + b, 0) / longLengths.length;

    console.log(`Average sentence lengths:`);
    console.log(`  Short: ${avgShort.toFixed(1)} characters`);
    console.log(`  Medium: ${avgMedium.toFixed(1)} characters`);
    console.log(`  Long: ${avgLong.toFixed(1)} characters`);

    // Verify proper length ordering
    expect(avgShort).toBeLessThan(avgMedium);
    expect(avgMedium).toBeLessThan(avgLong);

    // Reasonable bounds for each category
    expect(avgShort).toBeLessThan(50); // Short sentences should be under 50 chars on average
    expect(avgMedium).toBeGreaterThan(50); // Medium should be over 50
    expect(avgMedium).toBeLessThan(150); // Medium should be under 150
    expect(avgLong).toBeGreaterThan(150); // Long should be over 150
  });
});
