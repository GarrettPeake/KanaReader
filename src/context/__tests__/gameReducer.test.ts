import { describe, test, expect } from 'vitest';
import { gameReducer, initialGameState } from '../gameReducer';
import type { CharacterMapping } from '../../types';

const mockCharacter: CharacterMapping = {
  id: 'ka_a',
  character: 'ア',
  romanizations: ['a'],
  pronunciation: 'ah',
};

describe('gameReducer', () => {
  test('should initialize game correctly', () => {
    const action = { type: 'INITIALIZE_GAME' as const };
    const result = gameReducer(initialGameState, action);
    expect(result).toEqual(initialGameState);
  });

  test('should set user input', () => {
    const action = { type: 'SET_USER_INPUT' as const, payload: 'test input' };
    const result = gameReducer(initialGameState, action);
    expect(result.userInput).toBe('test input');
    expect(result.showFeedback).toBe(false);
  });

  test('should handle answer submission', () => {
    const validation = {
      isCorrect: true,
      expected: 'test',
      provided: 'test',
      feedback: 'Perfect!',
    };
    const action = { type: 'SUBMIT_ANSWER' as const, payload: validation };
    const result = gameReducer(initialGameState, action);
    
    expect(result.showFeedback).toBe(true);
    expect(result.feedbackMessage).toBe('Perfect!');
    expect(result.feedbackType).toBe('success');
  });

  test('should advance content', () => {
    const state = { ...initialGameState, currentContentIndex: 0 };
    const action = { type: 'ADVANCE_CONTENT' as const };
    const result = gameReducer(state, action);
    
    expect(result.currentContentIndex).toBe(1);
    expect(result.userInput).toBe('');
    expect(result.showFeedback).toBe(false);
  });

  test('should advance level', () => {
    const action = { type: 'ADVANCE_LEVEL' as const, payload: { newCharacter: mockCharacter } };
    const result = gameReducer(initialGameState, action);
    
    expect(result.currentCharacterIndex).toBe(1);
    expect(result.currentContentIndex).toBe(0);
    expect(result.unlockedCharacters.has(mockCharacter.id)).toBe(true);
    expect(result.showLevelTransition).toBe(true);
  });

  test('should advance level set', () => {
    const action = { type: 'ADVANCE_LEVEL_SET' as const, payload: { levelSetId: 'katakana' } };
    const result = gameReducer(initialGameState, action);
    
    expect(result.currentLevelSetId).toBe('katakana');
    expect(result.currentCharacterIndex).toBe(0);
    expect(result.currentContentIndex).toBe(0);
    expect(result.showLevelSetTransition).toBe(true);
  });

  test('should toggle menu', () => {
    const action = { type: 'TOGGLE_MENU' as const };
    const result = gameReducer(initialGameState, action);
    expect(result.menuOpen).toBe(true);
    
    const result2 = gameReducer(result, action);
    expect(result2.menuOpen).toBe(false);
  });

  test('should jump to level', () => {
    const action = { 
      type: 'JUMP_TO_LEVEL' as const, 
      payload: { levelSetId: 'hiragana', characterIndex: 5 } 
    };
    const result = gameReducer(initialGameState, action);
    
    expect(result.currentLevelSetId).toBe('hiragana');
    expect(result.currentCharacterIndex).toBe(5);
    expect(result.currentContentIndex).toBe(0);
    expect(result.menuOpen).toBe(false);
  });

  test('should complete game', () => {
    const action = { type: 'COMPLETE_GAME' as const };
    const result = gameReducer(initialGameState, action);
    expect(result.isComplete).toBe(true);
    expect(result.showFeedback).toBe(false);
  });

  test('should reset game', () => {
    const modifiedState = {
      ...initialGameState,
      currentLevelSetId: 'hiragana',
      currentCharacterIndex: 10,
      isComplete: true,
    };
    
    const action = { type: 'RESET_GAME' as const };
    const result = gameReducer(modifiedState, action);
    expect(result).toEqual(initialGameState);
  });

  test('should handle transition visibility', () => {
    const showAction = { type: 'SHOW_LEVEL_TRANSITION' as const, payload: true };
    const hideAction = { type: 'SHOW_LEVEL_TRANSITION' as const, payload: false };
    
    const showResult = gameReducer(initialGameState, showAction);
    expect(showResult.showLevelTransition).toBe(true);
    
    const hideResult = gameReducer(showResult, hideAction);
    expect(hideResult.showLevelTransition).toBe(false);
  });
});