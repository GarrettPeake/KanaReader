import type { ValidationResult } from '../types';

export class ValidationService {
  static validateAnswer(userInput: string, expectedAnswer: string): ValidationResult {
    const normalizedInput = this.normalizeText(userInput);
    const normalizedExpected = this.normalizeText(expectedAnswer);
    
    const isCorrect = normalizedInput === normalizedExpected;
    
    return {
      isCorrect,
      expected: expectedAnswer,
      provided: userInput,
      feedback: this.generateFeedback(isCorrect, userInput, expectedAnswer)
    };
  }

  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // Remove ALL whitespace
      .replace(/[.,!?;:'"()[\]{}\-_]/g, ''); // Remove all punctuation and special characters
  }

  private static generateFeedback(isCorrect: boolean, userInput: string, expectedAnswer: string): string {
    if (isCorrect) {
      return 'Perfect! Well done!';
    }

    // Check for common mistakes
    const normalizedInput = this.normalizeText(userInput);
    const normalizedExpected = this.normalizeText(expectedAnswer);

    if (normalizedInput.length === 0) {
      return 'Please type the English translation of the sentence.';
    }

    if (normalizedInput.includes(normalizedExpected) || normalizedExpected.includes(normalizedInput)) {
      return `Close! The correct answer is: "${expectedAnswer}"`;
    }

    // Calculate similarity for more helpful feedback
    const similarity = this.calculateSimilarity(normalizedInput, normalizedExpected);
    
    if (similarity > 0.7) {
      return `Very close! The correct answer is: "${expectedAnswer}"`;
    } else if (similarity > 0.4) {
      return `Good attempt! The correct answer is: "${expectedAnswer}"`;
    } else {
      return `The correct answer is: "${expectedAnswer}"`;
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation based on common characters
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}