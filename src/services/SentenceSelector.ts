import type { SentenceBank, CharacterMapping } from "../types";
import { TextReplacer } from "./TextReplacer";

export class SentenceSelector {
  static selectSentencesForCharacter(
    sentenceBank: SentenceBank,
    targetCharacter: CharacterMapping,
    count: number,
    preferredLength: "short" | "medium" | "long" = "short",
  ): string[] {
    // Get sentences of the preferred length
    const candidateSentences = sentenceBank[preferredLength];

    // Filter sentences that contain the target character's romanizations
    const isKanji =
      !targetCharacter.id.startsWith("hi_") &&
      !targetCharacter.id.startsWith("ka_");
    const validSentences = candidateSentences.filter((sentence) =>
      TextReplacer.hasTargetRomanizations(
        sentence,
        targetCharacter.romanizations,
        isKanji,
        targetCharacter.translations,
      ),
    );

    // If we don't have enough valid sentences, try other lengths
    if (validSentences.length < count) {
      const otherLengths = (["short", "medium", "long"] as const).filter(
        (l) => l !== preferredLength,
      );

      for (const length of otherLengths) {
        const additionalSentences = sentenceBank[length].filter(
          (sentence) =>
            TextReplacer.hasTargetRomanizations(
              sentence,
              targetCharacter.romanizations,
              isKanji,
              targetCharacter.translations,
            ) && !validSentences.includes(sentence),
        );
        validSentences.push(...additionalSentences);

        if (validSentences.length >= count) break;
      }
    }

    // Shuffle the valid sentences and take the requested count
    return validSentences
  }
}
