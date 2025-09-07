import type { CharacterMapping } from "../types";

export class TextReplacer {
  static replaceText(
    sentence: string,
    unlockedCharacters: CharacterMapping[],
  ): string {
    let result = sentence;

    // Separate kanji from other characters for different replacement strategies
    const kanjiMappings = unlockedCharacters.filter((mapping) =>
      mapping.id.startsWith("kanji_"),
    );
    const otherMappings = unlockedCharacters.filter(
      (mapping) => !mapping.id.startsWith("kanji_"),
    );

    // Process kanji with word boundary matching first
    const kanjiReplacements = kanjiMappings
      .flatMap((mapping) =>
        (mapping.translations || []).map((translation) => ({
          romanization: translation,
          character: mapping.character,
        })),
      )
      .sort((a, b) => b.romanization.length - a.romanization.length);

    for (const { romanization, character } of kanjiReplacements) {
      // Use word boundaries for kanji to prevent partial matches
      // \b matches word boundaries (non-letter to letter or letter to non-letter transitions)
      const regex = new RegExp(`\\b${romanization}\\b`, "gi");
      result = result.replace(regex, character);
    }

    // Process other characters (katakana/hiragana) with normal matching
    const otherReplacements = otherMappings
      .flatMap((mapping) =>
        mapping.romanizations.map((romanization) => ({
          romanization,
          character: mapping.character,
        })),
      )
      .sort((a, b) => b.romanization.length - a.romanization.length);

    for (const { romanization, character } of otherReplacements) {
      // Replace all instances, including partial matches within words (for katakana/hiragana)
      const regex = new RegExp(romanization, "gi");
      result = result.replace(regex, character);
    }

    return result;
  }

  static hasTargetRomanizations(
    sentence: string,
    romanizations: string[],
    isKanji: boolean = false,
    translations?: string[],
  ): boolean {
    // Check if the sentence contains any of the target romanizations or translations
    const lowerSentence = sentence.toLowerCase();
    const targetStrings = isKanji ? translations || [] : romanizations;
    return targetStrings.some((target) => {
      // Use word boundaries for kanji, normal matching for others
      const pattern = isKanji ? `\\b${target}\\b` : target;
      const regex = new RegExp(pattern, "i");
      return regex.test(lowerSentence);
    });
  }
}
