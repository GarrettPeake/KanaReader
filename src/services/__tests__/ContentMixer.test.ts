import { describe, test, expect } from 'vitest';
import { ContentMixer } from '../ContentMixer';
import type { Question } from '../../types';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'character-to-romanization',
    prompt: 'ア',
    acceptedAnswers: ['a'],
    characterId: 'ka_a'
  },
  {
    id: 'q2',
    type: 'character-to-romanization',
    prompt: 'イ',
    acceptedAnswers: ['i'],
    characterId: 'ka_i'
  }
];

const mockSentences = ['Hello world', 'This is a test sentence'];

describe('ContentMixer', () => {
  test('should mix content with correct proportions', () => {
    const mixed = ContentMixer.mixContent(mockSentences, mockQuestions, 0.5);
    
    expect(mixed).toHaveLength(4); // 2 sentences + 2 questions
    
    // Should contain all sentences and questions
    const sentenceItems = mixed.filter(item => item.type === 'sentence');
    const questionItems = mixed.filter(item => item.type === 'question');
    
    expect(sentenceItems).toHaveLength(2);
    expect(questionItems).toHaveLength(2);
  });

  test('should handle empty arrays', () => {
    const mixed1 = ContentMixer.mixContent([], [], 0.5);
    expect(mixed1).toHaveLength(0);
    
    const mixed2 = ContentMixer.mixContent(mockSentences, [], 0.5);
    expect(mixed2).toHaveLength(2);
    expect(mixed2.every(item => item.type === 'sentence')).toBe(true);
    
    const mixed3 = ContentMixer.mixContent([], mockQuestions, 0.5);
    expect(mixed3).toHaveLength(2);
    expect(mixed3.every(item => item.type === 'question')).toBe(true);
  });

  test('should preserve content correctly', () => {
    const mixed = ContentMixer.mixContent(mockSentences, mockQuestions, 0.5);
    
    const sentenceContents = mixed
      .filter(item => item.type === 'sentence')
      .map(item => item.content);
    
    const questionContents = mixed
      .filter(item => item.type === 'question')
      .map(item => item.content);
    
    // Should contain all original sentences
    expect(sentenceContents).toContain('Hello world');
    expect(sentenceContents).toContain('This is a test sentence');
    
    // Should contain all original questions
    expect(questionContents).toContain(mockQuestions[0]);
    expect(questionContents).toContain(mockQuestions[1]);
  });

  test('should get content by index correctly', () => {
    const mixed = ContentMixer.mixContent(mockSentences, mockQuestions, 0.5);
    
    const firstContent = ContentMixer.getContentByIndex(mixed, 0);
    expect(firstContent).toBeDefined();
    expect(typeof firstContent === 'string' || typeof firstContent === 'object').toBe(true);
    
    const invalidContent = ContentMixer.getContentByIndex(mixed, 999);
    expect(invalidContent).toBe('');
  });

  test('should return correct total count', () => {
    const mixed = ContentMixer.mixContent(mockSentences, mockQuestions, 0.5);
    const count = ContentMixer.getTotalContentCount(mixed);
    expect(count).toBe(4);
  });
});