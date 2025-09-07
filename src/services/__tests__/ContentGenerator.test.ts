import { describe, test, expect } from 'vitest';
import { ContentGenerator } from '../ContentGenerator';
import type { CharacterMapping } from '../../types/characters';
import type { SentenceBank } from '../../types/game';

const mockCharacter: CharacterMapping = {
  id: 'ka_a',
  character: 'ア',
  romanizations: ['a'],
  pronunciation: 'ah',
};

const mockSentenceBank: SentenceBank = {
  short: ['Hello world', 'This is a test'],
  medium: ['This is a medium sentence'],
  long: ['This is a very long sentence for practice']
};

describe('ContentGenerator', () => {
  const generator = new ContentGenerator();

  test('should generate tutorial content', () => {
    const content = generator.generateLevelContent(
      null,
      [],
      [],
      0,
      mockSentenceBank,
      'tutorial',
      0.35
    );

    expect(content).toHaveLength(2); // Mock sentence bank only has 2 short sentences
    expect(content.every(item => item.type === 'sentence')).toBe(true);
  });

  test('should generate mixed content for character levels', () => {
    const content = generator.generateLevelContent(
      mockCharacter,
      [],
      [mockCharacter],
      0,
      mockSentenceBank,
      'katakana',
      0.35
    );

    expect(content.length).toBeGreaterThan(0);
    
    const sentences = content.filter(item => item.type === 'sentence');
    const questions = content.filter(item => item.type === 'question');
    
    // Should have both types
    expect(sentences.length).toBeGreaterThan(0);
    expect(questions.length).toBeGreaterThan(0);
  });

  test('should validate content items correctly', () => {
    const sentenceItem = {
      id: 'test-sentence',
      type: 'sentence' as const,
      displayText: 'Hello world',
      originalText: 'Hello world'
    };

    const questionItem = {
      id: 'test-question',
      type: 'question' as const,
      displayText: 'ア',
      acceptedAnswers: ['a'],
      characterId: 'ka_a',
      difficulty: 1
    };

    // Test sentence validation
    const sentenceResult = generator.validateContentItem(sentenceItem, 'Hello world');
    expect(sentenceResult.isCorrect).toBe(true);

    const wrongSentenceResult = generator.validateContentItem(sentenceItem, 'Wrong answer');
    expect(wrongSentenceResult.isCorrect).toBe(false);

    // Test question validation
    const questionResult = generator.validateContentItem(questionItem, 'a');
    expect(questionResult.isCorrect).toBe(true);

    const wrongQuestionResult = generator.validateContentItem(questionItem, 'b');
    expect(wrongQuestionResult.isCorrect).toBe(false);
  });

  test('should handle practice mode', () => {
    const content = generator.generateLevelContent(
      null,
      [],
      [mockCharacter],
      0,
      mockSentenceBank,
      'practice',
      0.35
    );

    expect(content.length).toBeGreaterThan(0);
    expect(content.some(item => item.type === 'sentence')).toBe(true);
    expect(content.some(item => item.type === 'question')).toBe(true);
  });

  test('should use triangular weighting for character levels', () => {
    // Create multiple characters to test weighting
    const char1: CharacterMapping = { id: 'ka_a', character: 'ア', romanizations: ['a'], pronunciation: 'ah' };
    const char2: CharacterMapping = { id: 'ka_i', character: 'イ', romanizations: ['i'], pronunciation: 'ee' };
    const char3: CharacterMapping = { id: 'ka_u', character: 'ウ', romanizations: ['u'], pronunciation: 'oo' };
    
    const content = generator.generateLevelContent(
      char3, // Current character (most recent)
      [char1, char2], // Previous characters (older)
      [char1, char2, char3],
      2, // Level index (for 'u' level)
      mockSentenceBank,
      'katakana',
      0.35
    );

    expect(content.length).toBeGreaterThan(0);
    
    // Should have both sentences and questions
    const sentences = content.filter(item => item.type === 'sentence');
    const questions = content.filter(item => item.type === 'question');
    
    expect(sentences.length).toBeGreaterThan(0);
    expect(questions.length).toBeGreaterThan(0);
    
    // Questions should not have duplicates
    const questionCharacterIds = questions.map(q => q.characterId);
    const uniqueCharacterIds = new Set(questionCharacterIds);
    expect(questionCharacterIds.length).toEqual(uniqueCharacterIds.size);
  });

  test('should not have duplicate sentences within a level', () => {
    // Create multiple characters to increase content variety
    const char1: CharacterMapping = { id: 'ka_a', character: 'ア', romanizations: ['a'], pronunciation: 'ah' };
    const char2: CharacterMapping = { id: 'ka_i', character: 'イ', romanizations: ['i'], pronunciation: 'ee' };
    
    // Expanded sentence bank to test deduplication better
    const expandedSentenceBank = {
      short: ['I have a cat', 'This is fun', 'Hello world', 'Nice day today'],
      medium: ['This is a medium sentence', 'Another medium one'],
      long: ['This is a very long sentence for practice']
    };
    
    const content = generator.generateLevelContent(
      char2, // Current character
      [char1], // Previous characters
      [char1, char2],
      1, // Level index
      expandedSentenceBank,
      'katakana',
      0.7 // High sentence probability to test deduplication
    );

    // Get all sentences
    const sentences = content.filter(item => item.type === 'sentence');
    
    if (sentences.length > 1) {
      // Check that sentence original texts are unique
      const sentenceTexts = sentences.map(s => s.originalText || s.displayText);
      const uniqueTexts = new Set(sentenceTexts);
      expect(sentenceTexts.length).toEqual(uniqueTexts.size);
    }
  });

  test('should follow triangular progression for questions per level', () => {
    const char1: CharacterMapping = { id: 'ka_a', character: 'ア', romanizations: ['a'], pronunciation: 'ah' };
    const char2: CharacterMapping = { id: 'ka_i', character: 'イ', romanizations: ['i'], pronunciation: 'ee' };
    const char3: CharacterMapping = { id: 'ka_u', character: 'ウ', romanizations: ['u'], pronunciation: 'oo' };
    
    // Test the triangular progression: 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6...
    const expectedQuestions = [
      { level: 0, questions: 2 }, // Level 'a': 2 questions
      { level: 1, questions: 3 }, // Level 'i': 3 questions (+1 after 1 level)
      { level: 2, questions: 3 }, // Still 3 questions
      { level: 3, questions: 4 }, // Level 4: 4 questions (+1 after 2 more levels)
      { level: 4, questions: 4 }, 
      { level: 5, questions: 4 },
      { level: 6, questions: 5 }, // Level 7: 5 questions (+1 after 3 more levels)
      { level: 10, questions: 6 }, // Level 11: 6 questions (+1 after 4 more levels)
    ];

    expectedQuestions.forEach(({ level, questions }) => {
      const previousChars = level > 0 ? [char2, char3] : []; // Previous characters
      const content = generator.generateLevelContent(
        char1, // Current character
        previousChars,
        [char1, char2, char3],
        level,
        mockSentenceBank,
        'katakana',
        0.35
      );

      const actualQuestions = content.filter(item => item.type === 'question');
      const sentences = content.filter(item => item.type === 'sentence');
      
      // At level 0: only 1 character available, so 1 question + 3 sentences (2 base + 1 makeup)
      // At higher levels: more characters available, so closer to target questions + 2 base sentences
      const availableCharacters = previousChars.length + 1; // +1 for current character
      const expectedActualQuestions = Math.min(questions, availableCharacters);
      const expectedSentences = 2 + Math.max(0, questions - availableCharacters);
      
      expect(actualQuestions.length).toBe(expectedActualQuestions);
      expect(sentences.length).toBe(Math.min(expectedSentences, mockSentenceBank.short.length));
    });
  });

  test('should verify triangular calculation method directly', () => {
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
      { level: 10, expected: 6 }
    ];

    testCases.forEach(({ level, expected }) => {
      const actual = (generator as any).calculateQuestionsPerLevel(level);
      expect(actual).toBe(expected);
    });
  });
});