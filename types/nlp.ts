// types/nlp.ts
// Shared types used across the NLP pipeline and UI layer.

export type Tokens = string[];

export interface PreprocessOptions {
  lowercase: boolean;
  removeExtraSpaces: boolean;
  keepPunctuation: boolean;
  addSentenceBoundaries: boolean;
  vocabSize: number; // hard cap on vocabulary size. 0 = no cap
  unkToken: string;
  startToken: string;
  endToken: string;
}

export interface PreprocessResult {
  rawText: string;
  tokens: Tokens;
  vocabulary: string[];
  freq: Record<string, number>;
  uniqueBefore: number;
  uniqueAfter: number;
  unkReplacements: number;
}

export interface DatasetSplit {
  train: Tokens;
  validation: Tokens;
  test: Tokens;
}

export interface NGramCounts {
  // joined-by-space key for context, counts of full ngrams
  ngramCounts: Map<string, number>;
  // counts of context-only (n-1 grams)
  contextCounts: Map<string, number>;
  n: number;
  totalNgrams: number;
}

export interface AllCounts {
  unigrams: NGramCounts;
  bigrams: NGramCounts;
  trigrams: NGramCounts;
  fourgrams: NGramCounts;
  totalUnigrams: number;
  vocabulary: string[];
}

export interface LambdaWeights {
  unigram: number;
  bigram: number;
  trigram: number;
  fourgram: number;
}

export type GenerationStrategy = "greedy" | "weighted" | "top-k";

export interface GenerationOptions {
  maxWords: number;
  temperature: number;
  topK: number;
  strategy: GenerationStrategy;
}

export interface GenerationStep {
  step: number;
  context: string;
  selectedWord: string;
  probability: number;
}

export interface GenerationResult {
  generatedText: string;
  steps: GenerationStep[];
}

export interface ModelResult {
  name: string;
  method: string;
  smoothing: string;
  perplexity: number;
  settings: Record<string, unknown>;
}

export interface ExperimentReport {
  corpusSummary: {
    characters: number;
    words: number;
    sentences: number;
    vocabSize: number;
  };
  preprocessing: PreprocessOptions;
  split: { train: number; validation: number; test: number };
  modelResults: ModelResult[];
  bestHyperparameters?: {
    lambdas: LambdaWeights;
    k: number;
    perplexity: number;
  };
  generatedExamples: string[];
  createdAt: string;
}
