import { describe, test, expect } from 'vitest';
import { ValidationService } from '../ValidationService';

describe('ValidationService', () => {
  test('should validate correct answers', () => {
    const result = ValidationService.validateAnswer('Hello world', 'Hello world');
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Perfect! Well done!');
  });

  test('should handle case insensitive validation', () => {
    const result = ValidationService.validateAnswer('hello world', 'Hello World');
    expect(result.isCorrect).toBe(true);
  });

  test('should handle extra whitespace', () => {
    const result = ValidationService.validateAnswer('  hello world  ', 'Hello World');
    expect(result.isCorrect).toBe(true);
  });

  test('should ignore punctuation in comparison', () => {
    const result = ValidationService.validateAnswer('hello world', 'Hello, world!');
    expect(result.isCorrect).toBe(true);
  });

  test('should handle incorrect answers', () => {
    const result = ValidationService.validateAnswer('wrong answer', 'correct answer');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('correct answer');
  });

  test('should provide feedback for empty input', () => {
    const result = ValidationService.validateAnswer('', 'Hello world');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBe('Please type the English translation of the sentence.');
  });

  test('should provide close match feedback', () => {
    const result = ValidationService.validateAnswer('Hello worl', 'Hello world');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('Close!');
  });

  test('should return provided and expected values', () => {
    const result = ValidationService.validateAnswer('user input', 'expected output');
    expect(result.provided).toBe('user input');
    expect(result.expected).toBe('expected output');
  });

  test('should handle mixed spacing and punctuation errors', () => {
    const result = ValidationService.validateAnswer('hello,world!', 'Hello world.');
    expect(result.isCorrect).toBe(true);
  });

  test('should handle extra spaces between words', () => {
    const result = ValidationService.validateAnswer('hello    world', 'Hello world');
    expect(result.isCorrect).toBe(true);
  });

  test('should handle various punctuation marks', () => {
    const result = ValidationService.validateAnswer('hello-world_test', 'Hello world test');
    expect(result.isCorrect).toBe(true);
  });

  test('should handle quotes and parentheses', () => {
    const result = ValidationService.validateAnswer(`hello "world" (test)`, 'Hello world test');
    expect(result.isCorrect).toBe(true);
  });
});