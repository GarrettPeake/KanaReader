import type { LevelSet } from "../types";
import {
  JLPT_N5_KANJI,
  JLPT_N4_1_KANJI,
  JLPT_N4_2_KANJI,
  JLPT_N3_1_KANJI,
  JLPT_N3_2_KANJI,
  JLPT_N3_3_KANJI,
  JLPT_N3_4_KANJI,
  JLPT_N2_1_KANJI,
  JLPT_N2_2_KANJI,
  JLPT_N2_3_KANJI,
  JLPT_N2_4_KANJI,
  JLPT_N1_1_KANJI,
  JLPT_N1_2_KANJI,
  JLPT_N1_3_KANJI,
  JLPT_N1_4_KANJI,
  JLPT_N1_5_KANJI,
  JLPT_N1_6_KANJI,
  JLPT_N1_7_KANJI,
  JLPT_N1_8_KANJI,
  JLPT_N1_9_KANJI,
  JLPT_N1_10_KANJI,
  JLPT_N1_11_KANJI,
  JLPT_N1_12_KANJI,
} from "./jlptKanjiMappings";

// JLPT Level Sets
export const JLPT_LEVEL_SETS: LevelSet[] = [
  {
    id: "jlpt_n5",
    name: "Kanji (JLPT N5)",
    description: "JLPT N5 level kanji (80 characters)",
    explanation:
      "Essential kanji for JLPT N5 level. These are the most basic kanji you should learn first.",
    characterMappings: JLPT_N5_KANJI,
  },

  // N4 Level Sets (2 sets)
  {
    id: "jlpt_n4_1",
    name: "Kanji (JLPT N4 1/2)",
    description: "JLPT N4 level kanji - Part 1 (100 characters)",
    explanation:
      "First set of JLPT N4 kanji. Building on N5 foundation with more complex characters.",
    characterMappings: JLPT_N4_1_KANJI,
  },
  {
    id: "jlpt_n4_2",
    name: "Kanji (JLPT N4 2/2)",
    description: "JLPT N4 level kanji - Part 2 (70 characters)",
    explanation:
      "Second set of JLPT N4 kanji, completing the N4 level requirements.",
    characterMappings: JLPT_N4_2_KANJI,
  },

  // N3 Level Sets (4 sets)
  {
    id: "jlpt_n3_1",
    name: "Kanji (JLPT N3 1/4)",
    description: "JLPT N3 level kanji - Part 1 (100 characters)",
    explanation:
      "First set of JLPT N3 kanji. Intermediate level characters for everyday communication.",
    characterMappings: JLPT_N3_1_KANJI,
  },
  {
    id: "jlpt_n3_2",
    name: "Kanji (JLPT N3 2/4)",
    description: "JLPT N3 level kanji - Part 2 (100 characters)",
    explanation:
      "Second set of JLPT N3 kanji, building intermediate reading comprehension.",
    characterMappings: JLPT_N3_2_KANJI,
  },
  {
    id: "jlpt_n3_3",
    name: "Kanji (JLPT N3 3/4)",
    description: "JLPT N3 level kanji - Part 3 (100 characters)",
    explanation:
      "Third set of JLPT N3 kanji, expanding vocabulary for practical situations.",
    characterMappings: JLPT_N3_3_KANJI,
  },
  {
    id: "jlpt_n3_4",
    name: "Kanji (JLPT N3 4/4)",
    description: "JLPT N3 level kanji - Part 4 (70 characters)",
    explanation:
      "Final set of JLPT N3 kanji, completing intermediate level requirements.",
    characterMappings: JLPT_N3_4_KANJI,
  },

  // N2 Level Sets (4 sets)
  {
    id: "jlpt_n2_1",
    name: "Kanji (JLPT N2 1/4)",
    description: "JLPT N2 level kanji - Part 1 (100 characters)",
    explanation:
      "First set of JLPT N2 kanji. Upper-intermediate level for advanced communication.",
    characterMappings: JLPT_N2_1_KANJI,
  },
  {
    id: "jlpt_n2_2",
    name: "Kanji (JLPT N2 2/4)",
    description: "JLPT N2 level kanji - Part 2 (100 characters)",
    explanation:
      "Second set of JLPT N2 kanji, advancing toward professional-level literacy.",
    characterMappings: JLPT_N2_2_KANJI,
  },
  {
    id: "jlpt_n2_3",
    name: "Kanji (JLPT N2 3/4)",
    description: "JLPT N2 level kanji - Part 3 (100 characters)",
    explanation:
      "Third set of JLPT N2 kanji, building advanced reading skills.",
    characterMappings: JLPT_N2_3_KANJI,
  },
  {
    id: "jlpt_n2_4",
    name: "Kanji (JLPT N2 4/4)",
    description: "JLPT N2 level kanji - Part 4 (80 characters)",
    explanation:
      "Final set of JLPT N2 kanji, completing upper-intermediate requirements.",
    characterMappings: JLPT_N2_4_KANJI,
  },

  // N1 Level Sets (12 sets)
  {
    id: "jlpt_n1_1",
    name: "Kanji (JLPT N1 1/12)",
    description: "JLPT N1 level kanji - Part 1 (100 characters)",
    explanation:
      "First set of JLPT N1 kanji. Advanced level for native-like proficiency.",
    characterMappings: JLPT_N1_1_KANJI,
  },
  {
    id: "jlpt_n1_2",
    name: "Kanji (JLPT N1 2/12)",
    description: "JLPT N1 level kanji - Part 2 (100 characters)",
    explanation: "Second set of JLPT N1 kanji, advancing toward mastery.",
    characterMappings: JLPT_N1_2_KANJI,
  },
  {
    id: "jlpt_n1_3",
    name: "Kanji (JLPT N1 3/12)",
    description: "JLPT N1 level kanji - Part 3 (100 characters)",
    explanation:
      "Third set of JLPT N1 kanji, building sophisticated vocabulary.",
    characterMappings: JLPT_N1_3_KANJI,
  },
  {
    id: "jlpt_n1_4",
    name: "Kanji (JLPT N1 4/12)",
    description: "JLPT N1 level kanji - Part 4 (100 characters)",
    explanation:
      "Fourth set of JLPT N1 kanji, expanding academic and literary vocabulary.",
    characterMappings: JLPT_N1_4_KANJI,
  },
  {
    id: "jlpt_n1_5",
    name: "Kanji (JLPT N1 5/12)",
    description: "JLPT N1 level kanji - Part 5 (100 characters)",
    explanation:
      "Fifth set of JLPT N1 kanji, developing mastery of complex characters.",
    characterMappings: JLPT_N1_5_KANJI,
  },
  {
    id: "jlpt_n1_6",
    name: "Kanji (JLPT N1 6/12)",
    description: "JLPT N1 level kanji - Part 6 (100 characters)",
    explanation:
      "Sixth set of JLPT N1 kanji, approaching native-level literacy.",
    characterMappings: JLPT_N1_6_KANJI,
  },
  {
    id: "jlpt_n1_7",
    name: "Kanji (JLPT N1 7/12)",
    description: "JLPT N1 level kanji - Part 7 (100 characters)",
    explanation:
      "Seventh set of JLPT N1 kanji, mastering specialized vocabulary.",
    characterMappings: JLPT_N1_7_KANJI,
  },
  {
    id: "jlpt_n1_8",
    name: "Kanji (JLPT N1 8/12)",
    description: "JLPT N1 level kanji - Part 8 (100 characters)",
    explanation:
      "Eighth set of JLPT N1 kanji, building comprehensive literacy.",
    characterMappings: JLPT_N1_8_KANJI,
  },
  {
    id: "jlpt_n1_9",
    name: "Kanji (JLPT N1 9/12)",
    description: "JLPT N1 level kanji - Part 9 (100 characters)",
    explanation:
      "Ninth set of JLPT N1 kanji, advanced literary and academic terms.",
    characterMappings: JLPT_N1_9_KANJI,
  },
  {
    id: "jlpt_n1_10",
    name: "Kanji (JLPT N1 10/12)",
    description: "JLPT N1 level kanji - Part 10 (100 characters)",
    explanation: "Tenth set of JLPT N1 kanji, approaching complete mastery.",
    characterMappings: JLPT_N1_10_KANJI,
  },
  {
    id: "jlpt_n1_11",
    name: "Kanji (JLPT N1 11/12)",
    description: "JLPT N1 level kanji - Part 11 (100 characters)",
    explanation:
      "Eleventh set of JLPT N1 kanji, mastering the most complex characters.",
    characterMappings: JLPT_N1_11_KANJI,
  },
  {
    id: "jlpt_n1_12",
    name: "Kanji (JLPT N1 12/12)",
    description: "JLPT N1 level kanji - Part 12 (36 characters)",
    explanation:
      "Final set of JLPT N1 kanji, completing mastery of all Jōyō kanji.",
    characterMappings: JLPT_N1_12_KANJI,
  },
];
