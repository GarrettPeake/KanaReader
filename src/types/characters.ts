export interface CharacterMapping {
  id: string;
  character: string;
  romanizations: string[]; // Multiple romanizations, e.g., ['c', 'k', 'ck', 'que']
  pronunciation: string;
  translations?: string[]; // English translations for kanji (e.g., ['one', 'first'] for 一)
}

export interface LevelSet {
  id: 'tutorial' | 'katakana' | 'hiragana' | 'practice' | 'kanji';
  name: string;
  description: string;
  explanation: string;
  characterMappings: CharacterMapping[]; // Characters to unlock in order (array index = unlock order)
}