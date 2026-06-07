export type WordData = {
  word: string;
  id: number;
  level: number,
  description: string;
  instance: string;
  translation: string;
}

export type PhraseData = WordData;

export type ComparisonData = {
  id: number;
  title: string,
  words: string[];
  explain: string,
  not_matched: string[];
  synonyms: string[];
  level: number;
}