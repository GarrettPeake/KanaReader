import React, { createContext, useReducer, useEffect, useState } from "react";
import type {
  GameState,
  CharacterMapping,
  LevelSet,
  ProgressInfo,
} from "../types";
import type { ContentItem } from "../types/content";
import { gameReducer, initialGameState, type GameAction } from "./gameReducer";
import { LEVEL_SETS, SENTENCE_BANK } from "../data";
import { ProgressManager } from "../services";
import { ContentGenerator } from "../services/ContentGenerator";

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isLoaded: boolean;
  getCurrentLevelSet: () => LevelSet;
  getCurrentCharacter: () => CharacterMapping | null;
  getCurrentContentItem: () => ContentItem | null;
  generateNextContentItem: () => void;
  getUnlockedCharacters: () => CharacterMapping[];
  getProgressInfo: () => ProgressInfo;
  submitAnswer: (answer: string) => boolean; // Returns true if correct
  advanceToNext: () => void;
  advanceWithoutProgress: () => void; // Advance content but don't give progress/unlock characters
}

/* eslint-disable react-refresh/only-export-components */
export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isLoaded, setIsLoaded] = useState(false);
  const contentGenerator = new ContentGenerator();

  // Load progress on mount
  useEffect(() => {
    const savedProgress = ProgressManager.loadProgress();
    if (savedProgress) {
      dispatch({
        type: "LOAD_PROGRESS",
        payload: savedProgress,
      });
    } else {
      dispatch({ type: "INITIALIZE_GAME" });
    }
    setIsLoaded(true);
  }, []);

  // Update level metadata when level changes
  useEffect(() => {
    const totalQuestions = contentGenerator.calculateQuestionsPerLevel(
      state.currentCharacterIndex,
    );
    dispatch({
      type: "UPDATE_LEVEL_METADATA",
      payload: { totalQuestions },
    });

    // Reset level state for new level
    dispatch({ type: "RESET_LEVEL_STATE" });
  }, [state.currentLevelSetId, state.currentCharacterIndex]);

  // Generate initial content item when level resets or when we need a new item
  useEffect(() => {
    if (
      !state.currentContentItem &&
      state.currentContentIndex < state.currentLevelTotalQuestions
    ) {
      generateNextContentItem();
    }
  }, [
    state.currentContentItem,
    state.currentContentIndex,
    state.currentLevelTotalQuestions,
  ]);

  // Save progress whenever state changes (but only after initial load)
  useEffect(() => {
    if (isLoaded && state.currentLevelSetId) {
      ProgressManager.saveProgress(state);
    }
  }, [state, isLoaded]);

  const getCurrentLevelSet = (): LevelSet => {
    return (
      LEVEL_SETS.find((set) => set.id === state.currentLevelSetId) ||
      LEVEL_SETS[0]
    );
  };

  const getCurrentCharacter = (): CharacterMapping | null => {
    const currentLevelSet = getCurrentLevelSet();
    if (!currentLevelSet || currentLevelSet.characterMappings.length === 0)
      return null;
    return (
      currentLevelSet.characterMappings[state.currentCharacterIndex] || null
    );
  };

  const getCurrentContentItem = (): ContentItem | null => {
    return state.currentContentItem;
  };

  const generateNextContentItem = () => {
    // Don't generate if we're at the end of the level
    if (state.currentContentIndex >= state.currentLevelTotalQuestions) {
      return;
    }

    const currentCharacter = getCurrentCharacter();
    const currentLevelSet = getCurrentLevelSet();
    const unlockedCharacters = getUnlockedCharacters();
    const previousCharacters = currentLevelSet.characterMappings.slice(
      0,
      state.currentCharacterIndex,
    );

    // Use the new generateContentItemAtIndex method
    const result = contentGenerator.generateContentItemAtIndex(
      state.currentContentIndex,
      currentCharacter,
      previousCharacters,
      unlockedCharacters,
      state.currentCharacterIndex,
      SENTENCE_BANK,
      state.currentLevelSetId,
      state.usedCharacters,
      state.usedSentences,
    );

    // Update the current content item
    dispatch({ type: "SET_CURRENT_CONTENT_ITEM", payload: result.contentItem });

    // Update the used characters and sentences sets
    dispatch({
      type: "UPDATE_USED_STATE",
      payload: {
        usedCharacters: result.updatedUsedCharacters,
        usedSentences: result.updatedUsedSentences,
      },
    });
  };

  const getUnlockedCharacters = (): CharacterMapping[] => {
    const allCharacters = LEVEL_SETS.flatMap((set) => set.characterMappings);
    return Array.from(state.unlockedCharacters)
      .map((id) => allCharacters.find((char) => char.id === id))
      .filter((char): char is CharacterMapping => char !== undefined);
  };

  const getProgressInfo = (): ProgressInfo => {
    const currentLevelSet = getCurrentLevelSet();

    return {
      currentLevelProgress: {
        completed: state.currentContentIndex,
        total: state.currentLevelTotalQuestions,
        levelName: getCurrentCharacter()?.character || "Starting",
      },
      levelSetProgress: {
        completed: state.currentCharacterIndex,
        total: currentLevelSet.characterMappings.length || 1,
        setName: currentLevelSet.name,
      },
      overallProgress: {
        completed: Array.from(state.completedLevels).length,
        total: LEVEL_SETS.reduce(
          (total, set) => total + Math.max(set.characterMappings.length, 1),
          0,
        ),
      },
    };
  };

  const submitAnswer = (answer: string): boolean => {
    const contentItem = getCurrentContentItem();
    if (!contentItem) return false;

    const validation = contentGenerator.validateContentItem(
      contentItem,
      answer,
    );

    dispatch({
      type: "SUBMIT_ANSWER",
      payload: validation,
    });

    return validation.isCorrect;
  };

  const advanceWithoutProgress = () => {
    // Simply advance to next content item without giving any progress
    if (state.currentContentIndex >= state.currentLevelTotalQuestions - 1) {
      // At end of level content, but don't advance level/unlock anything
      // Just stay at the last content item
      return;
    } else {
      // Advance to next content item
      dispatch({ type: "ADVANCE_CONTENT" });
      // The useEffect will generate the next content item
    }
  };

  const advanceToNext = () => {
    const currentLevelSet = getCurrentLevelSet();

    // Check if we completed all content in current level
    if (state.currentContentIndex >= state.currentLevelTotalQuestions - 1) {
      // Level complete - check if we need to advance level set
      if (
        state.currentCharacterIndex >=
        currentLevelSet.characterMappings.length - 1
      ) {
        // Current level set complete
        const currentSetIndex = LEVEL_SETS.findIndex(
          (set) => set.id === state.currentLevelSetId,
        );
        const nextLevelSet = LEVEL_SETS[currentSetIndex + 1];

        if (nextLevelSet) {
          const firstCharacter = nextLevelSet.characterMappings[0];
          dispatch({
            type: "ADVANCE_LEVEL_SET",
            payload: {
              levelSetId: nextLevelSet.id,
              firstCharacter: firstCharacter,
            },
          });
        } else {
          dispatch({ type: "COMPLETE_GAME" });
        }
      } else {
        // Advance to next character in current level set
        const nextCharacter =
          currentLevelSet.characterMappings[state.currentCharacterIndex + 1];
        if (nextCharacter) {
          dispatch({
            type: "ADVANCE_LEVEL",
            payload: { newCharacter: nextCharacter },
          });
        }
      }
    } else {
      // Advance to next content item
      dispatch({ type: "ADVANCE_CONTENT" });
      // The useEffect will generate the next content item
    }
  };

  const value: GameContextType = {
    state,
    dispatch,
    isLoaded,
    getCurrentLevelSet,
    getCurrentCharacter,
    getCurrentContentItem,
    generateNextContentItem,
    getUnlockedCharacters,
    getProgressInfo,
    submitAnswer,
    advanceToNext,
    advanceWithoutProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
