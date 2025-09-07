import type { ContentItem } from '../types/content';
import type { CharacterMapping } from '../types/characters';
import type { Question } from '../types/game';
import { SentenceSelector, TextReplacer } from './index';
import { QuestionGenerator } from './QuestionGenerator';
import type { SentenceBank } from '../types/game';

export class ContentGenerator {
  private questionGenerator = new QuestionGenerator();

  /**
   * Get the total number of content items for a level
   */
  public getTotalContentItems(currentLevelIndex: number, levelSetId: string): number {
    if (levelSetId === 'tutorial') {
      return 3; // Fixed tutorial size
    } else if (levelSetId === 'practice') {
      return 8; // Fixed practice size
    } else {
      const questionsPerLevel = this.calculateQuestionsPerLevel(currentLevelIndex);
      return questionsPerLevel + 2; // Questions + 2 sentences
    }
  }

  /**
   * Generate a single content item on-demand and return updated state
   */
  public generateContentItemAtIndex(
    contentIndex: number,
    currentCharacter: CharacterMapping | null,
    previousCharacters: CharacterMapping[],
    unlockedCharacters: CharacterMapping[],
    currentLevelIndex: number,
    sentenceBank: SentenceBank,
    levelSetId: string,
    usedCharacters: Set<string> = new Set(),
    usedSentences: Set<string> = new Set()
  ): { contentItem: ContentItem | null; updatedUsedCharacters: Set<string>; updatedUsedSentences: Set<string> } {
    if (levelSetId === 'tutorial') {
      // Tutorial: only sentences
      const sentences = SentenceSelector.selectTutorialSentences(sentenceBank, 3);
      if (contentIndex < sentences.length) {
        const contentItem = {
          id: `tutorial-sentence-${contentIndex}`,
          type: 'sentence' as const,
          displayText: sentences[contentIndex],
          originalText: sentences[contentIndex]
        };
        return { 
          contentItem, 
          updatedUsedCharacters: usedCharacters, 
          updatedUsedSentences: usedSentences 
        };
      }
      return { 
        contentItem: null, 
        updatedUsedCharacters: usedCharacters, 
        updatedUsedSentences: usedSentences 
      };
    } else if (levelSetId === 'practice') {
      // Practice mode: mix of sentences and spaced repetition
      const sentences = SentenceSelector.selectPracticeSentences(sentenceBank, unlockedCharacters, 3);
      if (contentIndex < 3 && contentIndex < sentences.length) {
        const sentence = sentences[contentIndex];
        const contentItem = {
          id: `practice-sentence-${contentIndex}`,
          type: 'sentence' as const,
          displayText: TextReplacer.replaceText(sentence, unlockedCharacters),
          originalText: sentence
        };
        return { 
          contentItem, 
          updatedUsedCharacters: usedCharacters, 
          updatedUsedSentences: usedSentences 
        };
      } else {
        // Generate spaced repetition question
        const questions = this.questionGenerator.generateSpacedRepetitionQuestions(
          unlockedCharacters, 1, unlockedCharacters.length
        );
        if (questions.length > 0) {
          const contentItem = this.convertQuestionToContentItem(questions[0], `practice-question-${contentIndex}`);
          return { 
            contentItem, 
            updatedUsedCharacters: usedCharacters, 
            updatedUsedSentences: usedSentences 
          };
        }
      }
      return { 
        contentItem: null, 
        updatedUsedCharacters: usedCharacters, 
        updatedUsedSentences: usedSentences 
      };
    } else if (currentCharacter) {
      // Regular character level: on-demand generation with triangular progression
      return this.generateRegularLevelContentItem(
        contentIndex,
        currentCharacter,
        previousCharacters,
        unlockedCharacters,
        currentLevelIndex,
        sentenceBank,
        levelSetId,
        usedCharacters,
        usedSentences
      );
    }

    return { 
      contentItem: null, 
      updatedUsedCharacters: usedCharacters, 
      updatedUsedSentences: usedSentences 
    };
  }

  /**
   * Generate content items for a level with the specified mix (legacy method for tests)
   */
  public generateLevelContent(
    currentCharacter: CharacterMapping | null,
    previousCharacters: CharacterMapping[],
    unlockedCharacters: CharacterMapping[],
    currentLevelIndex: number,
    sentenceBank: SentenceBank,
    levelSetId: string,
    _sentenceProbability: number = 0.35 // Underscore prefix to indicate intentionally unused
  ): ContentItem[] {
    const contentItems: ContentItem[] = [];

    if (levelSetId === 'tutorial') {
      // Tutorial: only sentences, no questions
      const sentences = SentenceSelector.selectTutorialSentences(sentenceBank, 3);
      sentences.forEach((sentence, index) => {
        contentItems.push({
          id: `tutorial-sentence-${index}`,
          type: 'sentence',
          displayText: sentence, // No character replacements in tutorial
          originalText: sentence
        });
      });
    } else if (levelSetId === 'practice') {
      // Practice: mix of sentences and review questions
      const sentences = SentenceSelector.selectPracticeSentences(sentenceBank, unlockedCharacters, 3);
      const questions = this.questionGenerator.generateSpacedRepetitionQuestions(
        unlockedCharacters, 5, unlockedCharacters.length
      );

      // Add sentences
      sentences.forEach((sentence, index) => {
        const displayText = TextReplacer.replaceText(sentence, unlockedCharacters);
        contentItems.push({
          id: `practice-sentence-${index}`,
          type: 'sentence',
          displayText,
          originalText: sentence
        });
      });

      // Add questions
      questions.forEach((question, index) => {
        contentItems.push(this.convertQuestionToContentItem(question, `practice-question-${index}`));
      });

    } else if (currentCharacter) {
      // Regular character levels: use improved spaced repetition with triangular number weighting
      const sentences = SentenceSelector.selectSentencesForCharacter(
        sentenceBank,
        currentCharacter,
        2, // Fewer sentences to make room for questions
        'short'
      );
      
      // Create sentence content items
      // Only use characters from the current level set (current + previous in this level set)
      const levelSetCharacters = currentCharacter ? [currentCharacter, ...previousCharacters] : previousCharacters;
      const sentenceItems = sentences.map((sentence, index) => ({
        id: `${levelSetId}-sentence-${currentLevelIndex}-${index}`,
        type: 'sentence' as const,
        displayText: TextReplacer.replaceText(sentence, levelSetCharacters),
        originalText: sentence
      }));

      // Calculate number of questions using triangular progression
      const questionsPerLevel = this.calculateQuestionsPerLevel(currentLevelIndex);
      const usedCharacters = new Set<string>(); // Track used characters to avoid duplicates
      
      // All available characters for questions (current + previous)
      const allAvailableCharacters = currentCharacter ? [currentCharacter, ...previousCharacters] : previousCharacters;
      
      // First, generate as many unique questions as possible (up to questionsPerLevel)
      const maxPossibleQuestions = Math.min(questionsPerLevel, allAvailableCharacters.length);
      let questionsGenerated = 0;
      
      console.log(`Level ${currentLevelIndex}: Target=${questionsPerLevel}, MaxPossible=${maxPossibleQuestions}, AvailableChars=${allAvailableCharacters.length}`);
      
      for (let i = 0; i < maxPossibleQuestions; i++) {
        const selectedCharacter = this.selectCharacterWithTriangularWeighting(
          allAvailableCharacters,
          currentLevelIndex,
          usedCharacters
        );
        
        if (selectedCharacter) {
          usedCharacters.add(selectedCharacter.id);
          const question = this.questionGenerator.generateCurrentCharacterQuestions(selectedCharacter, 1)[0];
          if (question) {
            contentItems.push(this.convertQuestionToContentItem(question, `${levelSetId}-weighted-${currentLevelIndex}-${i}`));
            questionsGenerated++;
            console.log(`Level ${currentLevelIndex}: Generated question ${questionsGenerated} for character ${selectedCharacter.character}`);
          }
        }
      }

      // Fill remaining slots with sentences (both the base 2 sentences + any questions we couldn't generate)
      const remainingQuestions = questionsPerLevel - questionsGenerated;
      const totalSentencesToAdd = 2 + remainingQuestions; // Base 2 + make up for missing questions
      const maxSentencesToAdd = Math.min(totalSentencesToAdd, sentenceItems.length);
      
      console.log(`Level ${currentLevelIndex}: QuestionsGenerated=${questionsGenerated}, RemainingSentences=${totalSentencesToAdd}`);
      
      for (let i = 0; i < maxSentencesToAdd; i++) {
        if (sentenceItems.length > 0) {
          const sentenceIndex = Math.floor(Math.random() * sentenceItems.length);
          const selectedSentence = sentenceItems[sentenceIndex];
          contentItems.push(selectedSentence);
          // Remove from pool to avoid duplicates
          sentenceItems.splice(sentenceIndex, 1);
        }
      }
      
      const finalQuestions = contentItems.filter(item => item.type === 'question').length;
      const finalSentences = contentItems.filter(item => item.type === 'sentence').length;
      console.log(`Level ${currentLevelIndex}: FINAL - ${finalQuestions} questions, ${finalSentences} sentences, ${contentItems.length} total`);
      
    }

    return this.shuffleArray(contentItems);
  }

  /**
   * Generate a single content item for regular character levels using probability distributions
   */
  private generateRegularLevelContentItem(
    contentIndex: number,
    currentCharacter: CharacterMapping,
    previousCharacters: CharacterMapping[],
    _unlockedCharacters: CharacterMapping[],
    currentLevelIndex: number,
    sentenceBank: SentenceBank,
    levelSetId: string,
    usedCharacters: Set<string>,
    usedSentences: Set<string>
  ): { contentItem: ContentItem | null; updatedUsedCharacters: Set<string>; updatedUsedSentences: Set<string> } {
    const allAvailableCharacters = [currentCharacter, ...previousCharacters];
    
    // Use 35%/65% probability: 35% chance for sentence, 65% chance for romanization question
    const shouldBeSentence = Math.random() < 0.35;
    
    if (shouldBeSentence) {
      // Generate a sentence
      const result = this.generateSentenceItem(contentIndex, currentCharacter, previousCharacters, sentenceBank, levelSetId, usedSentences);
      return { 
        contentItem: result, 
        updatedUsedCharacters: usedCharacters, 
        updatedUsedSentences: usedSentences 
      };
    } else {
      // Generate a romanization question using triangular weighting
      const selectedCharacter = this.selectCharacterWithTriangularWeighting(
        allAvailableCharacters,
        currentLevelIndex,
        usedCharacters
      );
      
      if (selectedCharacter && !usedCharacters.has(selectedCharacter.id)) {
        usedCharacters.add(selectedCharacter.id);
        const question = this.questionGenerator.generateCurrentCharacterQuestions(selectedCharacter, 1)[0];
        if (question) {
          const contentItem = this.convertQuestionToContentItem(question, `${levelSetId}-question-${contentIndex}`);
          return { 
            contentItem, 
            updatedUsedCharacters: usedCharacters, 
            updatedUsedSentences: usedSentences 
          };
        }
      }
      
      // Fallback to sentence if no character available or already used
      const result = this.generateSentenceItem(contentIndex, currentCharacter, previousCharacters, sentenceBank, levelSetId, usedSentences);
      return { 
        contentItem: result, 
        updatedUsedCharacters: usedCharacters, 
        updatedUsedSentences: usedSentences 
      };
    }
  }

  /**
   * Generate a sentence content item
   */
  private generateSentenceItem(
    contentIndex: number,
    currentCharacter: CharacterMapping,
    previousCharacters: CharacterMapping[],
    sentenceBank: SentenceBank,
    levelSetId: string,
    usedSentences: Set<string>
  ): ContentItem | null {
    // Only use characters from the current level set (current + previous in this level set)
    const levelSetCharacters = [currentCharacter, ...previousCharacters];
    
    const sentences = SentenceSelector.selectSentencesForCharacter(
      sentenceBank,
      currentCharacter,
      10, // Get more sentences to choose from
      'short'
    );
    
    // If no sentences found for this character, return null to prevent infinite loops
    if (sentences.length === 0) {
      return null;
    }
    
    // Find an unused sentence
    const availableSentences = sentences.filter(sentence => !usedSentences.has(sentence));
    
    if (availableSentences.length > 0) {
      const selectedSentence = availableSentences[contentIndex % availableSentences.length];
      usedSentences.add(selectedSentence);
      
      return {
        id: `${levelSetId}-sentence-${contentIndex}`,
        type: 'sentence',
        displayText: TextReplacer.replaceText(selectedSentence, levelSetCharacters),
        originalText: selectedSentence
      };
    }
    
    // If no unused sentences, allow reuse 
    const selectedSentence = sentences[contentIndex % sentences.length];
    return {
      id: `${levelSetId}-sentence-${contentIndex}`,
      type: 'sentence',
      displayText: TextReplacer.replaceText(selectedSentence, levelSetCharacters),
      originalText: selectedSentence
    };
  }

  /**
   * Convert a Question to a ContentItem
   */
  private convertQuestionToContentItem(question: Question, id: string): ContentItem {
    return {
      id,
      type: 'question',
      displayText: question.prompt,
      acceptedAnswers: question.acceptedAnswers,
      characterId: question.characterId,
      hintText: question.hintText
    };
  }

  /**
   * Validate an answer against a content item
   */
  public validateContentItem(contentItem: ContentItem, userAnswer: string): {
    isCorrect: boolean;
    expected: string;
    provided: string;
    feedback: string;
  } {
    const normalizedAnswer = userAnswer.toLowerCase().trim();

    if (contentItem.type === 'sentence') {
      // Validate against original text
      const expected = contentItem.originalText || contentItem.displayText;
      const isCorrect = expected.toLowerCase().trim() === normalizedAnswer;
      
      return {
        isCorrect,
        expected,
        provided: userAnswer,
        feedback: isCorrect ? 'Perfect!' : `Correct answer: ${expected}`
      };
    } else {
      // Question validation
      const acceptedAnswers = contentItem.acceptedAnswers || [];
      const isCorrect = acceptedAnswers.some(answer => 
        answer.toLowerCase().trim() === normalizedAnswer
      );
      
      // Determine feedback message based on question type
      let feedbackMessage = 'Correct!';
      if (!isCorrect) {
        // Check if this is a meaning question (English words) vs romanization question
        const isEnglishAnswer = acceptedAnswers.some(answer => 
          ['one', 'two', 'three', 'four', 'five'].includes(answer.toLowerCase())
        );
        feedbackMessage = isEnglishAnswer
          ? `Correct meaning: ${acceptedAnswers.join(' / ')}`
          : `Correct romanization: ${acceptedAnswers.join(' / ')}`;
      }
      
      return {
        isCorrect,
        expected: acceptedAnswers[0] || '',
        provided: userAnswer,
        feedback: feedbackMessage
      };
    }
  }

  /**
   * Calculate number of questions per level using triangular progression
   * Level 0: 2 questions, Level 1: 3 (+1 after 1), Level 3: 4 (+1 after 2), 
   * Level 6: 5 (+1 after 3), Level 10: 6 (+1 after 4), etc.
   */
  public calculateQuestionsPerLevel(currentLevelIndex: number): number {
    // Triangular progression: increases at levels 0, 1, 3, 6, 10, 15, 21...
    // Questions: 2, 3, 4, 5, 6, 7, 8...
    
    // Find the current tier by checking triangular number thresholds
    let questions = 2;
    let tier = 1; // Start with tier 1 (next increase after 1 level)
    let triangularNumber = 1; // T(1) = 1
    
    while (triangularNumber <= currentLevelIndex) {
      questions++;
      tier++;
      triangularNumber += tier; // T(n) = T(n-1) + n
    }
    
    return questions;
  }

  /**
   * Select a character using triangular number weighting for spaced repetition
   * More recent levels get exponentially higher probability
   */
  private selectCharacterWithTriangularWeighting(
    availableCharacters: CharacterMapping[],
    currentLevelIndex: number,
    usedCharacters: Set<string>
  ): CharacterMapping | null {
    if (availableCharacters.length === 0) return null;

    // Filter out already used characters
    const unusedCharacters = availableCharacters.filter(char => !usedCharacters.has(char.id));
    if (unusedCharacters.length === 0) return null;

    // Calculate triangular number sum: 1 + 2 + 3 + ... + (currentLevelIndex + 1)
    // We use currentLevelIndex + 1 because level 0 should still have weight
    const maxLevel = currentLevelIndex + 1;
    const triangularSum = (maxLevel * (maxLevel + 1)) / 2;

    // Generate random lottery draw
    const randomValue = Math.random();
    const lotteryDraw = Math.floor(randomValue * triangularSum);

    // Map lottery draw back to level index
    // Level i gets weight (maxLevel - i), and occupies positions from sum(1..maxLevel-i-1) to sum(1..maxLevel-i)-1
    let cumulativeWeight = 0;
    for (let levelOffset = 0; levelOffset < maxLevel; levelOffset++) {
      const levelWeight = maxLevel - levelOffset; // Higher levels get more weight
      
      if (lotteryDraw < cumulativeWeight + levelWeight) {
        // This level was selected - find the character at this position
        const selectedCharacterIndex = Math.min(levelOffset, unusedCharacters.length - 1);
        
        // If the exact level doesn't have a character, pick the most recent available one
        if (selectedCharacterIndex < unusedCharacters.length) {
          return unusedCharacters[selectedCharacterIndex];
        }
        break;
      }
      
      cumulativeWeight += levelWeight;
    }

    // Fallback: return the most recent character (first in array)
    return unusedCharacters[0] || null;
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
}