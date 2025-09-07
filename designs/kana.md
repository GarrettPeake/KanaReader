# KanaReader - Technical Design Document

## Architecture Overview

### Component Hierarchy
```
App
├── GameProvider (Context)
├── Header
│   └── LevelIndicator
├── SideMenu
│   ├── CharacterTable
│   └── LevelNavigator
├── MainGame
│   ├── LevelTransition
│   ├── LevelSetTransition
│   ├── SentenceDisplay
│   ├── InputField
│   ├── FeedbackDisplay
│   └── SuccessScreen
├── Footer
│   └── ProgressBar
└── ErrorBoundary
```

### State Management
- **Context API** for global game state
- **useReducer** for complex state transitions
- **localStorage** for progress persistence

## Data Models

### Character Mapping
```typescript
interface CharacterMapping {
  id: string;
  character: string;
  romanizations: string[]; // Multiple romanizations, e.g., ['c', 'k', 'ck', 'que']
  pronunciation: string;
}

// Example mappings
const KATAKANA_MAPPINGS: CharacterMapping[] = [
  { id: 'ka_a', character: 'ア', romanizations: ['a'], pronunciation: 'ah' },
  { id: 'ka_i', character: 'イ', romanizations: ['i'], pronunciation: 'ee' },
  { id: 'ka_ka', character: 'カ', romanizations: ['ca', 'ka'], pronunciation: 'kah' },
  // ... more mappings (unlock order is implicit in array index)
];

const HIRAGANA_MAPPINGS: CharacterMapping[] = [
  { id: 'hi_a', character: 'あ', romanizations: ['a'], pronunciation: 'ah' },
  { id: 'hi_i', character: 'い', romanizations: ['i'], pronunciation: 'ee' },
  // ... more mappings
];
```

### Level Structure
```typescript
interface Level {
  id: string;
  characterMapping: CharacterMapping;
  sentenceCount: number; // Number of sentences to complete for this level
}

interface LevelSet {
  id: 'tutorial' | 'katakana' | 'hiragana' | 'practice' | 'kanji';
  name: string;
  description: string;
  explanation: string;
  characterMappings: CharacterMapping[]; // Characters to unlock in order (array index = unlock order)
}
```

### Game State
```typescript
interface GameState {
  currentLevelSetId: string;
  currentLevelId: string;
  currentSentenceIndex: number;
  unlockedCharacters: Set<string>;
  completedLevels: Set<string>;
  userInput: string;
  showFeedback: boolean;
  feedbackMessage: string;
  isComplete: boolean;
  menuOpen: boolean;
}
```

### Sentence Data
```typescript
interface SentenceBank {
  short: string[];    // Short sentences for early levels
  medium: string[];   // Medium sentences for mid-game
  long: string[];     // Long sentences for practice/advanced levels
}

// Sentences are dynamically selected based on containing the target character's romanizations
// No need for character-specific sentence storage
```

## Core Logic Components

### Character Replacement Engine
```typescript
class TextReplacer {
  static replaceText(sentence: string, unlockedCharacters: CharacterMapping[]): string {
    let result = sentence;
    
    // Flatten all romanizations and sort by length desc to handle longer ones first (e.g., 'cha' before 'ch')
    const allReplacements = unlockedCharacters.flatMap(mapping => 
      mapping.romanizations.map(romanization => ({ 
        romanization, 
        character: mapping.character 
      }))
    ).sort((a, b) => b.romanization.length - a.romanization.length);
    
    for (const { romanization, character } of allReplacements) {
      const regex = new RegExp(romanization, 'gi');
      result = result.replace(regex, character);
    }
    
    return result;
  }
}
```

### Level Progression Manager
```typescript
class LevelProgressionManager {
  static getNextLevel(currentState: GameState): Level | null;
  static isLevelComplete(currentState: GameState): boolean;
  static isLevelSetComplete(currentState: GameState): boolean;
  static unlockCharacter(characterId: string, state: GameState): GameState;
  static calculateProgress(currentState: GameState): ProgressInfo;
}
```

### Progress Persistence
```typescript
interface ProgressData {
  unlockedCharacters: string[];
  completedLevels: string[];
  currentLevelSetId: string;
  currentLevelId: string;
  timestamp: number;
}

class ProgressManager {
  static saveProgress(state: GameState): void;
  static loadProgress(): ProgressData | null;
  static resetProgress(): void;
}
```

## Component Design Details

### MainGame Component
**Responsibilities:**
- Orchestrate game flow
- Handle user input validation
- Manage level transitions
- Display appropriate UI state

**Key Methods:**
```typescript
- handleUserSubmit(input: string): void
- validateAnswer(userInput: string, expectedAnswer: string): ValidationResult
- advanceToNextSentence(): void
- advanceToNextLevel(): void
- showLevelTransition(character: CharacterMapping): void
```

### SentenceDisplay Component
**Responsibilities:**
- Render sentences with character replacements
- Handle text animation/transitions
- Display character highlighting

### ProgressBar Component (Footer)
**Responsibilities:**
- Visual progress within current level
- Overall progress indication
- Level name display with visual progress
- Clean footer positioning

**Visual Design:**
```
Footer: Current Level: イ [=====     ] (5/10 sentences) | Katakana [========  ] (8/10 characters)
```

### SideMenu Component
**Responsibilities:**
- Character table display by level set
- Quick level navigation
- Progress overview
- Settings/reset options

**Structure:**
```
├── Level Set Tabs (Katakana, Hiragana, etc.)
├── Character Grid (unlocked/locked indicators)
├── Quick Jump Navigation
└── Progress Summary
```

### LevelTransition Component
**Responsibilities:**
- Show newly unlocked character
- Display pronunciation guide
- Animate character introduction
- Provide level set explanations

## User Flow Design

### Game Flow State Machine
```
Tutorial Level → Katakana Levels → Hiragana Levels → Practice Level → Success
     ↓               ↓                ↓                ↓
  Plain Text    Cumulative      Cumulative      Mixed Usage
                Katakana        Hiragana        All Chars
```

### Level Transition Flow
1. User completes current level sentences
2. Show character unlock animation
3. Display character info (symbol, romanization, pronunciation)
4. Show progress update
5. Load next level with new character active

### Level Set Transition Flow
1. Complete final level of current set
2. Show level set completion celebration
3. Display educational content about next set
4. Reset cumulative characters for hiragana set
5. Begin first level of next set

## Testing Strategy

### Unit Testing (Vitest)
```typescript
// Example test structure
describe('TextReplacer', () => {
  test('should replace single romanizations correctly');
  test('should handle multiple romanizations per character');
  test('should prioritize longer romanizations (ck before c)');
  test('should be case insensitive');
  test('should handle overlapping romanizations correctly');
  test('should handle edge cases (punctuation, etc.)');
});

describe('SentenceSelector', () => {
  test('should find sentences containing target romanizations');
  test('should return correct number of sentences');
  test('should handle different sentence lengths');
});

describe('LevelProgressionManager', () => {
  test('should calculate correct next level');
  test('should handle level set transitions');
  test('should track completion correctly');
});
```

### Integration Testing
```typescript
describe('Game Flow Integration', () => {
  test('should progress through tutorial correctly');
  test('should unlock characters in proper sequence');
  test('should maintain cumulative replacements');
  test('should handle level set transitions');
  test('should complete full game cycle');
});
```

### Component Testing
```typescript
describe('MainGame Component', () => {
  test('should render current sentence correctly');
  test('should handle user input validation');
  test('should show appropriate feedback');
  test('should progress levels correctly');
});
```

## File Structure

```
src/
├── components/
│   ├── game/
│   │   ├── MainGame.tsx
│   │   ├── SentenceDisplay.tsx
│   │   ├── InputField.tsx
│   │   ├── FeedbackDisplay.tsx
│   │   └── SuccessScreen.tsx
│   ├── navigation/
│   │   ├── SideMenu.tsx
│   │   └── CharacterTable.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ProgressBar.tsx
│   ├── transitions/
│   │   ├── LevelTransition.tsx
│   │   └── LevelSetTransition.tsx
│   └── common/
│       └── ErrorBoundary.tsx
├── context/
│   ├── GameContext.tsx
│   ├── GameProvider.tsx
│   └── gameReducer.ts
├── data/
│   ├── characterMappings.ts
│   ├── levelDefinitions.ts
│   ├── sentenceBank.ts
│   └── levelSets.ts
├── hooks/
│   ├── useGameState.ts
│   ├── useProgress.ts
│   └── useLocalStorage.ts
├── services/
│   ├── TextReplacer.ts
│   ├── SentenceSelector.ts
│   ├── LevelProgressionManager.ts
│   ├── ProgressManager.ts
│   └── ValidationService.ts
├── types/
│   ├── game.ts
│   ├── characters.ts
│   └── levels.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── validation.ts
└── styles/
    ├── globals.css
    ├── components.css
    └── animations.css
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load level data on demand
2. **Memoization**: Cache character replacement results
3. **Virtual Scrolling**: For large character tables
4. **Debounced Input**: Prevent excessive validation calls

### Bundle Size Management
1. **Code Splitting**: Separate level data bundles
2. **Tree Shaking**: Remove unused character mappings
3. **Asset Optimization**: Compress fonts and images

## Accessibility Features

### ARIA Implementation
- Screen reader support for progress indicators
- Keyboard navigation for side menu
- Focus management during transitions
- Alt text for character displays

### Keyboard Shortcuts
- `Tab`/`Shift+Tab`: Navigation
- `Enter`: Submit answer
- `Escape`: Close menu
- `Arrow Keys`: Navigate character table

## Future Extensibility

### Kanji Level Set Integration
```typescript
// Kanji follows the same simplified pattern - just character mappings in a level set
const KANJI_MAPPINGS: CharacterMapping[] = [
  { id: 'kanji_ichi', character: '一', romanizations: ['ichi', 'one'], pronunciation: 'ee-chee' },
  { id: 'kanji_ni', character: '二', romanizations: ['ni', 'two'], pronunciation: 'nee' },
  // ... more mappings (unlock order is implicit in array index)
];
```

### Plugin Architecture
```typescript
interface LevelSetPlugin {
  id: string;
  name: string;
  description: string;
  explanation: string;
  characterMappings: CharacterMapping[];
}
```

## Implementation Phases

### Phase 1: Core Architecture
- Set up React app with TypeScript
- Implement context and state management
- Create basic component structure
- Add comprehensive testing setup

### Phase 2: Game Logic
- Implement character mapping system
- Create text replacement engine
- Build level progression logic
- Add progress persistence

### Phase 3: User Interface
- Design and implement main game UI
- Create transition animations
- Build progress indicators
- Implement side menu system

### Phase 4: Polish & Testing
- Comprehensive test coverage
- Accessibility improvements
- Performance optimization
- User experience refinements

### Phase 5: Advanced Features
- Advanced progression metrics
- Social features (optional)
- Kanji level set preparation