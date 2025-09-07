import type { LevelSet } from '../types';
import { KATAKANA_MAPPINGS, HIRAGANA_MAPPINGS, KANJI_MAPPINGS } from './characterMappings';

export const LEVEL_SETS: LevelSet[] = [
  {
    id: 'katakana',
    name: 'Katakana',
    description: 'Learn katakana characters',
    explanation: 'Katakana is used for foreign words, onomatopoeia, and emphasis. Each character represents a syllable sound.',
    characterMappings: KATAKANA_MAPPINGS,
  },
  {
    id: 'hiragana',
    name: 'Hiragana',
    description: 'Learn hiragana characters',
    explanation: 'Hiragana is used for native Japanese words, grammatical particles, and verb endings. It\'s the foundation of Japanese writing.',
    characterMappings: HIRAGANA_MAPPINGS,
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Mixed practice with longer sentences',
    explanation: 'Practice your skills with longer sentences using both katakana and hiragana characters randomly.',
    characterMappings: [...KATAKANA_MAPPINGS, ...HIRAGANA_MAPPINGS],
  },
  {
    id: 'kanji',
    name: 'Kanji (Basic)',
    description: 'Learn basic kanji characters',
    explanation: 'Kanji are logographic characters representing concepts or words. Start with the most basic ones.',
    characterMappings: KANJI_MAPPINGS,
  },
];