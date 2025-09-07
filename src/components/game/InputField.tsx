import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../hooks/useGameContext';

export function InputField() {
  const { state, dispatch, submitAnswer, advanceToNext, advanceWithoutProgress, getCurrentContentItem, getUnlockedCharacters } = useGameContext();
  const [localInput, setLocalInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts or when we advance to next content
  useEffect(() => {
    if (inputRef.current && !state.showLevelTransition && !state.showLevelSetTransition) {
      inputRef.current.focus();
    }
  }, [state.currentContentIndex, state.showLevelTransition, state.showLevelSetTransition]);

  // Update local input when global state changes
  useEffect(() => {
    setLocalInput(state.userInput);
  }, [state.userInput]);

  // Clear input when advancing
  useEffect(() => {
    if (state.currentContentIndex === 0 && state.userInput === '') {
      setLocalInput('');
    }
  }, [state.currentContentIndex, state.userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalInput(value);
    dispatch({ type: 'SET_USER_INPUT', payload: value });
    
    // Check for auto-submit
    const currentContent = getCurrentContentItem();
    if (currentContent && currentContent.acceptedAnswers && value.trim()) {
      // Check if the current input matches any accepted answer
      const normalizedInput = value.trim().toLowerCase();
      const isCorrect = currentContent.acceptedAnswers.some(answer => 
        answer.toLowerCase().trim() === normalizedInput
      );
      
      if (isCorrect) {
        // Auto-submit the correct answer
        setTimeout(() => {
          handleAutoSubmit(value.trim());
        }, 100); // Small delay to let the UI update
      }
    }
  };
  
  const handleAutoSubmit = (answer: string) => {
    // Submit the answer and get immediate result
    const isCorrect = submitAnswer(answer);
    
    // Auto-advance after showing feedback briefly
    setTimeout(() => {
      if (isCorrect) {
        // Correct answer: advance with progress (unlock characters, etc.)
        advanceToNext();
      } else {
        // Wrong answer: advance without progress (just move to next question)
        advanceWithoutProgress();
      }
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localInput.trim()) {
      // Submit the answer and get immediate result
      const isCorrect = submitAnswer(localInput.trim());
      
      // Auto-advance after showing feedback briefly
      setTimeout(() => {
        if (isCorrect) {
          // Correct answer: advance with progress (unlock characters, etc.)
          advanceToNext();
        } else {
          // Wrong answer: advance without progress (just move to next question)
          advanceWithoutProgress();
        }
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const getPlaceholderText = () => {
    const currentContent = getCurrentContentItem();
    
    if (!currentContent) {
      return "Enter your answer...";
    }

    if (currentContent.type === 'sentence') {
      return "Enter English sentence with romanizations";
    } else {
      // This is a question - need to determine if it's romanization or meaning
      if (currentContent.characterId) {
        // Find the character to get example romanization
        const allCharacters = getUnlockedCharacters();
        const character = allCharacters.find(char => char.id === currentContent.characterId);
        
        if (character) {
          // Check if this is a kanji character (meaning question)
          if (character.id.startsWith('kanji_')) {
            return "Enter English translation";
          } else {
            // Katakana/Hiragana romanization question - use a generic example
            return "Enter romanization, e.g. 'ka'";
          }
        }
      }
      
      return "Enter romanization";
    }
  };

  // Don't render during transitions
  if (state.showLevelTransition || state.showLevelSetTransition || state.isComplete) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="input-container">
      <input
        ref={inputRef}
        type="text"
        value={localInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholderText()}
        className="text-input"
        disabled={state.showFeedback}
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
}