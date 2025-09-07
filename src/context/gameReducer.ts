import type { GameState, ValidationResult, CharacterMapping } from '../types';
import type { ContentItem } from '../types/content';
import { LEVEL_SETS } from '../data';

export type GameAction =
  | { type: 'INITIALIZE_GAME' }
  | { type: 'LOAD_PROGRESS'; payload: { unlockedCharacters: string[]; completedLevels: string[]; currentLevelSetId: string; currentCharacterIndex: number } }
  | { type: 'SET_USER_INPUT'; payload: string }
  | { type: 'SUBMIT_ANSWER'; payload: ValidationResult }
  | { type: 'ADVANCE_CONTENT' }
  | { type: 'ADVANCE_SENTENCE' } // Keep for backward compatibility 
  | { type: 'ADVANCE_LEVEL'; payload: { newCharacter: CharacterMapping } }
  | { type: 'ADVANCE_LEVEL_SET'; payload: { levelSetId: string; firstCharacter?: CharacterMapping } }
  | { type: 'TOGGLE_MENU' }
  | { type: 'JUMP_TO_LEVEL'; payload: { levelSetId: string; characterIndex: number } }
  | { type: 'SHOW_LEVEL_TRANSITION'; payload: boolean }
  | { type: 'SHOW_LEVEL_SET_TRANSITION'; payload: boolean }
  | { type: 'SET_CURRENT_CONTENT_ITEM'; payload: ContentItem | null }
  | { type: 'UPDATE_LEVEL_METADATA'; payload: { totalQuestions: number } }
  | { type: 'UPDATE_USED_STATE'; payload: { usedCharacters: Set<string>; usedSentences: Set<string> } }
  | { type: 'RESET_LEVEL_STATE' } // Reset used characters/sentences for new level
  | { type: 'COMPLETE_GAME' }
  | { type: 'RESET_GAME' };

export const initialGameState: GameState = {
  currentLevelSetId: '',
  currentCharacterIndex: 0,
  currentContentIndex: 0,
  currentLevelTotalQuestions: 0,
  usedCharacters: new Set<string>(),
  usedSentences: new Set<string>(),
  unlockedCharacters: new Set<string>(),
  completedLevels: new Set<string>(),
  currentContentItem: null,
  userInput: '',
  showFeedback: false,
  feedbackMessage: '',
  feedbackType: 'info',
  isComplete: false,
  menuOpen: false,
  showLevelTransition: false,
  showLevelSetTransition: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return { ...initialGameState };

    case 'LOAD_PROGRESS':
      return {
        ...state,
        unlockedCharacters: new Set(action.payload.unlockedCharacters),
        completedLevels: new Set(action.payload.completedLevels),
        currentLevelSetId: action.payload.currentLevelSetId,
        currentCharacterIndex: action.payload.currentCharacterIndex,
      };

    case 'SET_USER_INPUT':
      return {
        ...state,
        userInput: action.payload,
        showFeedback: false,
      };

    case 'SUBMIT_ANSWER':
      return {
        ...state,
        showFeedback: true,
        feedbackMessage: action.payload.feedback,
        feedbackType: action.payload.isCorrect ? 'success' : 'error',
      };

    case 'ADVANCE_CONTENT':
      return {
        ...state,
        currentContentIndex: state.currentContentIndex + 1,
        userInput: '',
        showFeedback: false,
        currentContentItem: null, // Will be generated on-demand
      };

    case 'ADVANCE_SENTENCE': // Backward compatibility
      return {
        ...state,
        currentContentIndex: state.currentContentIndex + 1,
        userInput: '',
        showFeedback: false,
      };

    case 'ADVANCE_LEVEL': {
      const newLevelId = `${state.currentLevelSetId}-${state.currentCharacterIndex}`;
      return {
        ...state,
        currentCharacterIndex: state.currentCharacterIndex + 1,
        currentContentIndex: 0,
        completedLevels: new Set([...state.completedLevels, newLevelId]),
        unlockedCharacters: new Set([...state.unlockedCharacters, action.payload.newCharacter.id]),
        usedCharacters: new Set<string>(),
        usedSentences: new Set<string>(),
        currentContentItem: null,
        userInput: '',
        showFeedback: false,
        showLevelTransition: true,
      };
    }

    case 'ADVANCE_LEVEL_SET':
      return {
        ...state,
        currentLevelSetId: action.payload.levelSetId,
        currentCharacterIndex: 0,
        currentContentIndex: 0,
        usedCharacters: new Set<string>(),
        usedSentences: new Set<string>(),
        currentContentItem: null,
        userInput: '',
        showFeedback: false,
        showLevelSetTransition: true,
        showLevelTransition: action.payload.firstCharacter ? true : false,
        unlockedCharacters: action.payload.firstCharacter 
          ? new Set([...state.unlockedCharacters, action.payload.firstCharacter.id])
          : state.unlockedCharacters,
      };

    case 'TOGGLE_MENU':
      return {
        ...state,
        menuOpen: !state.menuOpen,
      };

    case 'JUMP_TO_LEVEL': {
      // When jumping to a level, unlock all characters/levels up to that point
      const { levelSetId, characterIndex } = action.payload;
      
      // Find the target level set
      const targetLevelSet = LEVEL_SETS.find(set => set.id === levelSetId);
      const targetLevelSetIndex = LEVEL_SETS.findIndex(set => set.id === levelSetId);
      
      if (!targetLevelSet) {
        return state; // Invalid level set
      }
      
      // Unlock all characters from previous level sets and up to target character
      let unlockedCharacterIds = new Set<string>();
      let completedLevelIds = new Set<string>();
      
      // Unlock all characters from previous complete level sets
      for (let i = 0; i < targetLevelSetIndex; i++) {
        const levelSet = LEVEL_SETS[i];
        for (let j = 0; j < levelSet.characterMappings.length; j++) {
          const character = levelSet.characterMappings[j];
          unlockedCharacterIds.add(character.id);
          completedLevelIds.add(`${levelSet.id}-${j}`);
        }
      }
      
      // Unlock characters up to and including the target character in the target level set
      for (let j = 0; j <= characterIndex && j < targetLevelSet.characterMappings.length; j++) {
        const character = targetLevelSet.characterMappings[j];
        unlockedCharacterIds.add(character.id);
        if (j < characterIndex) {
          completedLevelIds.add(`${levelSetId}-${j}`);
        }
      }
      
      return {
        ...state,
        currentLevelSetId: levelSetId,
        currentCharacterIndex: characterIndex,
        currentContentIndex: 0,
        unlockedCharacters: unlockedCharacterIds,
        completedLevels: completedLevelIds,
        userInput: '',
        showFeedback: false,
        menuOpen: false,
      };
    }

    case 'SHOW_LEVEL_TRANSITION':
      return {
        ...state,
        showLevelTransition: action.payload,
      };

    case 'SHOW_LEVEL_SET_TRANSITION':
      return {
        ...state,
        showLevelSetTransition: action.payload,
      };

    case 'SET_CURRENT_CONTENT_ITEM':
      return {
        ...state,
        currentContentItem: action.payload,
      };

    case 'UPDATE_LEVEL_METADATA':
      return {
        ...state,
        currentLevelTotalQuestions: action.payload.totalQuestions,
      };

    case 'UPDATE_USED_STATE':
      return {
        ...state,
        usedCharacters: action.payload.usedCharacters,
        usedSentences: action.payload.usedSentences,
      };

    case 'RESET_LEVEL_STATE':
      return {
        ...state,
        usedCharacters: new Set<string>(),
        usedSentences: new Set<string>(),
        currentContentIndex: 0,
        currentContentItem: null,
      };

    case 'COMPLETE_GAME':
      return {
        ...state,
        isComplete: true,
        showFeedback: false,
      };

    case 'RESET_GAME':
      return { ...initialGameState };

    default:
      return state;
  }
}