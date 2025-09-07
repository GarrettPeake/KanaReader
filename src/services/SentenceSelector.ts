import type { SentenceBank, CharacterMapping } from '../types';
import { TextReplacer } from './TextReplacer';

export class SentenceSelector {
  static selectSentencesForCharacter(
    sentenceBank: SentenceBank,
    targetCharacter: CharacterMapping,
    count: number,
    preferredLength: 'short' | 'medium' | 'long' = 'short'
  ): string[] {
    // Get sentences of the preferred length
    const candidateSentences = sentenceBank[preferredLength];
    
    // Filter sentences that contain the target character's romanizations
    const isKanji = targetCharacter.id.startsWith('kanji_');
    const validSentences = candidateSentences.filter(sentence =>
      TextReplacer.hasTargetRomanizations(sentence, targetCharacter.romanizations, isKanji, targetCharacter.translations)
    );
    
    // If we don't have enough valid sentences, try other lengths
    if (validSentences.length < count) {
      const otherLengths = (['short', 'medium', 'long'] as const).filter(l => l !== preferredLength);
      
      for (const length of otherLengths) {
        const additionalSentences = sentenceBank[length].filter(sentence =>
          TextReplacer.hasTargetRomanizations(sentence, targetCharacter.romanizations, isKanji, targetCharacter.translations) &&
          !validSentences.includes(sentence)
        );
        validSentences.push(...additionalSentences);
        
        if (validSentences.length >= count) break;
      }
    }
    
    // Shuffle the valid sentences and take the requested count
    const shuffled = this.shuffleArray([...validSentences]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  static selectTutorialSentences(sentenceBank: SentenceBank, count: number): string[] {
    // For tutorial, just use short sentences without any character requirements
    const shuffled = this.shuffleArray([...sentenceBank.short]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  static selectPracticeSentences(
    sentenceBank: SentenceBank,
    unlockedCharacters: CharacterMapping[],
    count: number
  ): string[] {
    // For practice mode, use longer sentences that contain multiple unlocked characters
    const candidateSentences = sentenceBank.long;
    
    // Filter sentences that contain at least one unlocked character
    const validSentences = candidateSentences.filter(sentence =>
      unlockedCharacters.some(char => {
        const isKanji = char.id.startsWith('kanji_');
        return TextReplacer.hasTargetRomanizations(sentence, char.romanizations, isKanji, char.translations);
      })
    );
    
    // Shuffle and return requested count
    const shuffled = this.shuffleArray([...validSentences]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}