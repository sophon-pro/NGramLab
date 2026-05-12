// lib/nlp/split.ts
// Split a token stream into train/validation/test by contiguous slices.

import type { DatasetSplit, Tokens } from "@/types/nlp";

export function splitDataset(
  tokens: Tokens,
  trainRatio: number,
  validationRatio: number,
  testRatio: number
): DatasetSplit {
  const sum = trainRatio + validationRatio + testRatio;
  // Allow tiny floating-point drift but otherwise insist the ratios sum to 1.
  if (Math.abs(sum - 1) > 1e-6) {
    throw new Error(
      `Split ratios must sum to 1, got ${sum.toFixed(3)} (${trainRatio}+${validationRatio}+${testRatio})`
    );
  }
  const n = tokens.length;
  const trainEnd = Math.floor(n * trainRatio);
  const valEnd = trainEnd + Math.floor(n * validationRatio);
  return {
    train: tokens.slice(0, trainEnd),
    validation: tokens.slice(trainEnd, valEnd),
    test: tokens.slice(valEnd),
  };
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number) {
  const rand = seededRandom(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sentenceChunks(
  tokens: Tokens,
  startToken: string,
  endToken: string
): Tokens[] {
  const chunks: Tokens[] = [];
  let current: Tokens = [];

  tokens.forEach((token) => {
    if (token === startToken && current.length > 0) {
      chunks.push(current);
      current = [];
    }

    current.push(token);

    if (token === endToken) {
      chunks.push(current);
      current = [];
    }
  });

  if (current.length > 0) chunks.push(current);
  return chunks.filter((chunk) => chunk.some((token) => token !== startToken && token !== endToken));
}

function applyTrainVocabulary(
  split: DatasetSplit,
  options: { startToken: string; endToken: string; unkToken: string; minTrainCount: number }
): DatasetSplit {
  const trainFreq = new Map<string, number>();
  split.train.forEach((token) => {
    if (token === options.startToken || token === options.endToken) return;
    trainFreq.set(token, (trainFreq.get(token) ?? 0) + 1);
  });

  const trainVocabulary = new Set<string>([
    options.startToken,
    options.endToken,
    options.unkToken,
  ]);
  trainFreq.forEach((count, token) => {
    if (count >= options.minTrainCount) trainVocabulary.add(token);
  });

  const mapTokens = (inputTokens: Tokens) =>
    inputTokens.map((token) => (trainVocabulary.has(token) ? token : options.unkToken));

  return {
    train: mapTokens(split.train),
    validation: mapTokens(split.validation),
    test: mapTokens(split.test),
  };
}

export function splitDatasetWithTrainVocabulary(
  tokens: Tokens,
  trainRatio: number,
  validationRatio: number,
  testRatio: number,
  options: {
    startToken?: string;
    endToken?: string;
    unkToken?: string;
    minTrainCount?: number;
    shuffleSentences?: boolean;
    seed?: number;
  } = {}
): DatasetSplit {
  const sum = trainRatio + validationRatio + testRatio;
  if (Math.abs(sum - 1) > 1e-6) {
    throw new Error(
      `Split ratios must sum to 1, got ${sum.toFixed(3)} (${trainRatio}+${validationRatio}+${testRatio})`
    );
  }

  const startToken = options.startToken ?? "<s>";
  const endToken = options.endToken ?? "</s>";
  const unkToken = options.unkToken ?? "<UNK>";
  const minTrainCount = options.minTrainCount ?? 2;
  const chunks = sentenceChunks(tokens, startToken, endToken);

  if (chunks.length <= 1) {
    return applyTrainVocabulary(
      splitDataset(tokens, trainRatio, validationRatio, testRatio),
      { startToken, endToken, unkToken, minTrainCount }
    );
  }

  const rows =
    options.shuffleSentences === false
      ? chunks
      : shuffle(chunks, options.seed ?? 42);

  const n = rows.length;
  const trainEnd = Math.floor(n * trainRatio);
  const valEnd = trainEnd + Math.floor(n * validationRatio);
  const trainRows = rows.slice(0, trainEnd);
  const validationRows = rows.slice(trainEnd, valEnd);
  const testRows = rows.slice(valEnd);

  return applyTrainVocabulary(
    {
      train: trainRows.flat(),
      validation: validationRows.flat(),
      test: testRows.flat(),
    },
    { startToken, endToken, unkToken, minTrainCount }
  );
}
