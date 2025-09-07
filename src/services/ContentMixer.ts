import type { Question } from '../types';

export interface MixedContent {
  type: 'sentence' | 'question';
  content: string | Question;
  index: number; // Original index in the respective array
}

export class ContentMixer {
  /**
   * Mix sentences and questions randomly with specified probabilities
   * @param sentences Array of sentences
   * @param questions Array of questions
   * @param sentenceProbability Probability of selecting a sentence (0-1, default 0.35)
   * @returns Array of mixed content items
   */
  public static mixContent(
    sentences: string[], 
    questions: Question[], 
    sentenceProbability: number = 0.35
  ): MixedContent[] {
    const mixedContent: MixedContent[] = [];
    
    // Create arrays with content metadata
    const sentenceItems: MixedContent[] = sentences.map((sentence, index) => ({
      type: 'sentence' as const,
      content: sentence,
      index
    }));
    
    const questionItems: MixedContent[] = questions.map((question, index) => ({
      type: 'question' as const,
      content: question,
      index
    }));
    
    // Calculate total items based on the probability distribution
    const totalSentences = sentenceItems.length;
    const totalQuestions = questionItems.length;
    const totalItems = totalSentences + totalQuestions;
    
    if (totalItems === 0) return [];
    
    // If we only have one type, return it all
    if (totalSentences === 0) return questionItems;
    if (totalQuestions === 0) return sentenceItems;
    
    // Create indices for shuffling
    let sentenceIndex = 0;
    let questionIndex = 0;
    
    // Generate mixed content array based on probabilities
    for (let i = 0; i < totalItems; i++) {
      const shouldSelectSentence = Math.random() < sentenceProbability;
      
      if (shouldSelectSentence && sentenceIndex < totalSentences) {
        mixedContent.push(sentenceItems[sentenceIndex]);
        sentenceIndex++;
      } else if (!shouldSelectSentence && questionIndex < totalQuestions) {
        mixedContent.push(questionItems[questionIndex]);
        questionIndex++;
      } else {
        // Fallback: if we've exhausted one type, use the other
        if (sentenceIndex < totalSentences) {
          mixedContent.push(sentenceItems[sentenceIndex]);
          sentenceIndex++;
        } else if (questionIndex < totalQuestions) {
          mixedContent.push(questionItems[questionIndex]);
          questionIndex++;
        }
      }
    }
    
    // Ensure we haven't missed any items
    while (sentenceIndex < totalSentences) {
      mixedContent.push(sentenceItems[sentenceIndex]);
      sentenceIndex++;
    }
    
    while (questionIndex < totalQuestions) {
      mixedContent.push(questionItems[questionIndex]);
      questionIndex++;
    }
    
    // Shuffle the final array for better distribution
    return this.shuffleArray(mixedContent);
  }
  
  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Get content item by mixed content index
   */
  public static getContentByIndex(mixedContent: MixedContent[], index: number): string | Question {
    if (index < 0 || index >= mixedContent.length) {
      return '';
    }
    
    return mixedContent[index].content;
  }
  
  /**
   * Get total mixed content count
   */
  public static getTotalContentCount(mixedContent: MixedContent[]): number {
    return mixedContent.length;
  }
}