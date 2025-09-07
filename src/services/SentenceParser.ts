import type { CharacterMapping } from '../types';

export interface SentenceReplacement {
  original: string;     // The kana/kanji character (e.g., "三")
  expected: string;     // The expected English (e.g., "three")
  startIndex: number;   // Position in display text
  endIndex: number;     // End position in display text
  characterId?: string; // Reference to the character mapping
}

export class SentenceParser {
  /**
   * Parse a sentence to find all kana/kanji replacements and their expected English translations
   */
  static parseReplacements(
    displayText: string, 
    _originalText: string, 
    availableCharacters: CharacterMapping[]
  ): SentenceReplacement[] {
    const replacements: SentenceReplacement[] = [];
    
    // Create a map of characters to their translations/romanizations
    const characterMap = new Map<string, CharacterMapping>();
    availableCharacters.forEach(char => {
      characterMap.set(char.character, char);
    });
    
    // Find all Japanese characters (hiragana, katakana, kanji) in the display text
    // Process character by character to handle each individually
    for (let i = 0; i < displayText.length; i++) {
      const character = displayText[i];
      
      // Check if this is a Japanese character
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/.test(character)) {
        const charMapping = characterMap.get(character);
        if (charMapping) {
          // For kanji, use translations; for kana, use romanizations
          const expectedAnswers = charMapping.translations || charMapping.romanizations;
          const primaryAnswer = expectedAnswers[0];
          
          if (primaryAnswer) {
            replacements.push({
              original: character,
              expected: primaryAnswer.toLowerCase(),
              startIndex: i,
              endIndex: i + 1,
              characterId: charMapping.id
            });
          }
        }
      }
    }
    
    return replacements.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Reconstruct the original sentence by replacing kana/kanji with their expected translations
   */
  static reconstructOriginalText(displayText: string, replacements: SentenceReplacement[]): string {
    let result = displayText;
    
    // Replace from end to start to maintain correct indices
    for (let i = replacements.length - 1; i >= 0; i--) {
      const replacement = replacements[i];
      result = result.slice(0, replacement.startIndex) + 
               replacement.expected + 
               result.slice(replacement.endIndex);
    }
    
    return result;
  }

  /**
   * Validate that the parsed replacements would recreate the original text
   */
  static validateReplacements(
    displayText: string, 
    originalText: string, 
    replacements: SentenceReplacement[]
  ): boolean {
    const reconstructed = this.reconstructOriginalText(displayText, replacements);
    return reconstructed.toLowerCase().trim() === originalText.toLowerCase().trim();
  }
}