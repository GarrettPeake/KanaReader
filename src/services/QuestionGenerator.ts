import type { Question } from '../types/game';
import type { CharacterMapping } from '../types/characters';

export class QuestionGenerator {
  private generateQuestionId(type: string, characterId: string): string {
    return `${type}-${characterId}-${Date.now()}`;
  }

  /**
   * Generate questions for the current character being learned
   */
  public generateCurrentCharacterQuestions(character: CharacterMapping, count: number): Question[] {
    const questions: Question[] = [];
    const isKanji = character.id.startsWith('kanji_');
    
    if (isKanji && character.translations) {
      // For kanji, randomly choose between meaning and romanization questions
      // This ensures we get a mix of both types
      const shouldGenerateMeaning = Math.random() < 0.5; // 50/50 chance
      
      if (shouldGenerateMeaning) {
        // Generate meaning question
        questions.push({
          id: this.generateQuestionId('character-to-meaning', character.id),
          type: 'character-to-meaning',
          prompt: character.character,
          acceptedAnswers: character.translations,
          characterId: character.id,
          hintText: character.romanizations.join(' / ') // Show romanization as hint for meaning questions
        });
      } else {
        // Generate romanization question
        questions.push({
          id: this.generateQuestionId('character-to-romanization', character.id),
          type: 'character-to-romanization',
          prompt: character.character,
          acceptedAnswers: character.romanizations,
          characterId: character.id,
          hintText: character.translations.join(' / ') // Show meaning as hint for romanization questions
        });
      }
    } else {
      // For katakana/hiragana, generate romanization questions (no hint needed)
      const actualCount = Math.min(count, 1);
      for (let i = 0; i < actualCount; i++) {
        questions.push({
          id: this.generateQuestionId('character-to-romanization', character.id),
          type: 'character-to-romanization',
          prompt: character.character,
          acceptedAnswers: character.romanizations,
          characterId: character.id
        });
      }
    }
    
    return questions;
  }

  /**
   * Generate spaced repetition questions from previously learned characters
   */
  public generateSpacedRepetitionQuestions(
    previousCharacters: CharacterMapping[], 
    count: number,
    currentLevelIndex: number
  ): Question[] {
    if (previousCharacters.length === 0 || count === 0) {
      return [];
    }

    const questions: Question[] = [];
    const usedCharacters = new Set<string>(); // Track used characters to avoid duplicates
    
    // Calculate how many questions each previous character should get
    // More recent characters get more questions (higher probability)
    const weights = this.calculateSpacedRepetitionWeights(previousCharacters.length, currentLevelIndex);
    
    // Generate questions, avoiding duplicates
    let attempts = 0;
    const maxAttempts = count * 3; // Prevent infinite loops
    
    while (questions.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Select character based on weights (more recent = higher chance)
      const selectedIndex = this.weightedRandomSelect(weights);
      const character = previousCharacters[selectedIndex];
      
      // Skip if we already used this character
      if (usedCharacters.has(character.id)) {
        continue;
      }
      
      usedCharacters.add(character.id);
      
      const isKanji = character.id.startsWith('kanji_');
      
      if (isKanji && character.translations) {
        // For kanji, randomly generate either meaning or romanization questions
        const shouldGenerateMeaning = Math.random() < 0.5; // 50/50 chance
        
        if (shouldGenerateMeaning) {
          questions.push({
            id: this.generateQuestionId('character-to-meaning', character.id),
            type: 'character-to-meaning',
            prompt: character.character,
            acceptedAnswers: character.translations,
            characterId: character.id,
            hintText: character.romanizations.join(' / ') // Show romanization as hint
          });
        } else {
          questions.push({
            id: this.generateQuestionId('character-to-romanization', character.id),
            type: 'character-to-romanization',
            prompt: character.character,
            acceptedAnswers: character.romanizations,
            characterId: character.id,
            hintText: character.translations.join(' / ') // Show meaning as hint
          });
        }
      } else {
        // For katakana/hiragana, generate romanization questions (no hint needed)
        questions.push({
          id: this.generateQuestionId('character-to-romanization', character.id),
          type: 'character-to-romanization',
          prompt: character.character,
          acceptedAnswers: character.romanizations,
          characterId: character.id
        });
      }
    }
    
    return questions;
  }

  /**
   * Calculate weights for spaced repetition - more recent characters get higher weights
   */
  private calculateSpacedRepetitionWeights(characterCount: number, currentLevelIndex: number): number[] {
    const weights: number[] = [];
    
    for (let i = 0; i < characterCount; i++) {
      // Characters learned more recently get higher weights
      // Use exponential decay: more recent = higher weight
      const recency = characterCount - i; // 1 = oldest, characterCount = newest
      const baseWeight = Math.pow(2, recency / characterCount); // Exponential curve
      
      // Boost weight for characters learned in recent levels
      const levelsSinceIntroduction = currentLevelIndex - i;
      const recencyBoost = levelsSinceIntroduction <= 5 ? 1.5 : 1.0;
      
      weights.push(baseWeight * recencyBoost);
    }
    
    return weights;
  }

  /**
   * Select an index based on weights (higher weight = higher probability)
   */
  private weightedRandomSelect(weights: number[]): number {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        return i;
      }
    }
    
    // Fallback to last index if we somehow don't select anything
    return weights.length - 1;
  }

  /**
   * Generate mixed content (sentences and questions) for a level
   */
  public generateLevelQuestions(
    currentCharacter: CharacterMapping | null,
    previousCharacters: CharacterMapping[],
    currentLevelIndex: number,
    questionCount: number,
    spacedRepetitionCount: number
  ): Question[] {
    const questions: Question[] = [];
    
    // Generate questions for current character
    if (currentCharacter && questionCount > 0) {
      questions.push(...this.generateCurrentCharacterQuestions(currentCharacter, questionCount));
    }
    
    // Generate spaced repetition questions
    if (spacedRepetitionCount > 0) {
      questions.push(...this.generateSpacedRepetitionQuestions(
        previousCharacters, 
        spacedRepetitionCount, 
        currentLevelIndex
      ));
    }
    
    // Shuffle questions for variety
    return this.shuffleArray(questions);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validate user input against question
   */
  public validateAnswer(question: Question, userInput: string): boolean {
    const normalizedInput = userInput.toLowerCase().trim();
    return question.acceptedAnswers.some(answer => 
      answer.toLowerCase().trim() === normalizedInput
    );
  }

  /**
   * Get formatted feedback for a question
   */
  public getQuestionFeedback(question: Question, isCorrect: boolean): string {
    if (isCorrect) {
      return "Correct!";
    }
    
    const expectedAnswers = question.acceptedAnswers.join(' / ');
    switch (question.type) {
      case 'character-to-romanization':
        return `Correct romanization: ${expectedAnswers}`;
      case 'word-to-meaning':
      case 'character-to-meaning':
        return `Correct meaning: ${expectedAnswers}`;
      default:
        return `Correct answer: ${expectedAnswers}`;
    }
  }
}