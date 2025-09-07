export interface Question {
  id: string;
  type: 'character-to-romanization' | 'word-to-meaning' | 'character-to-meaning';
  prompt: string; // The Japanese character/word shown to user
  acceptedAnswers: string[]; // Valid romanizations/meanings
  characterId: string; // For spaced repetition tracking
  hintText?: string; // For kanji: romanization for meaning questions, meaning for romanization questions
}

export interface GameState {
  currentLevelSetId: string;
  currentCharacterIndex: number; // Index in the current level set's character mappings
  currentContentIndex: number; // Index for current content item (0-based within level)
  currentLevelTotalQuestions: number; // Total questions for current level (triangular progression)
  usedCharacters: Set<string>; // Characters used in current level (for deduplication)
  usedSentences: Set<string>; // Sentences used in current level (for deduplication)
  unlockedCharacters: Set<string>; // Character IDs
  completedLevels: Set<string>; // Level IDs (levelSetId-characterIndex format)
  currentContentItem: import('../types/content').ContentItem | null; // Current question being shown
  userInput: string;
  showFeedback: boolean;
  feedbackMessage: string;
  feedbackType: 'success' | 'error' | 'info';
  isComplete: boolean;
  menuOpen: boolean;
  showLevelTransition: boolean;
  showLevelSetTransition: boolean;
}

export interface Level {
  id: string;
  levelSetId: string;
  characterIndex: number;
  sentenceCount: number; // Number of sentences to complete for this level
  questionCount: number; // Number of questions to complete for this level
  spacedRepetitionCount: number; // Number of review questions from previous characters
}

export interface SentenceBank {
  short: string[];    // Short sentences for early levels
  medium: string[];   // Medium sentences for mid-game
  long: string[];     // Long sentences for practice/advanced levels
}

export interface ProgressInfo {
  currentLevelProgress: {
    completed: number;
    total: number;
    levelName: string;
  };
  levelSetProgress: {
    completed: number;
    total: number;
    setName: string;
  };
  overallProgress: {
    completed: number;
    total: number;
  };
}

export interface ValidationResult {
  isCorrect: boolean;
  expected: string;
  provided: string;
  feedback: string;
}