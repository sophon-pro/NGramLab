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
