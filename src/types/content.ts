// Unified content item that knows how to validate itself
export interface ContentItem {
  id: string;
  type: "sentence" | "question";
  displayText: string; // What to show to the user (may have character replacements)
  originalText?: string; // For sentences: the original English text to validate against
  acceptedAnswers?: string[]; // For questions: valid answers
  characterId?: string; // For spaced repetition tracking
  hintText?: string; // For kanji questions: romanization for translation questions, meaning for romanization questions
}
