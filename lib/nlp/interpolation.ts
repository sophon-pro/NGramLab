// lib/nlp/interpolation.ts
// LM2 — Linear interpolation of unigram, bigram, trigram, 4-gram probabilities
// where each component is add-k smoothed.

import type { AllCounts, LambdaWeights } from "@/types/nlp";
import { addKProbability } from "./smoothing";

/**
 * Smoothed conditional probability for a single n-gram order.
 * `contextTokens` length must equal n - 1.
 */
function smoothedConditional(
  contextTokens: string[],
  word: string,
  counts: AllCounts,
  n: 1 | 2 | 3 | 4,
  k: number
): number {
  const V = counts.vocabulary.length;
  if (n === 1) {
    const c = counts.unigrams.ngramCounts.get(word) ?? 0;
    return addKProbability(c, counts.totalUnigrams, V, k);
  }
  const ctx = contextTokens.slice(-(n - 1)).join(" ");
  const full = ctx + " " + word;
  const orderCounts =
    n === 2 ? counts.bigrams : n === 3 ? counts.trigrams : counts.fourgrams;
  const ngramCount = orderCounts.ngramCounts.get(full) ?? 0;
  const ctxCount = orderCounts.contextCounts.get(ctx) ?? 0;
  return addKProbability(ngramCount, ctxCount, V, k);
}

/**
 * Interpolated probability: λ1·P_uni + λ2·P_bi + λ3·P_tri + λ4·P_four.
 */
export function getInterpolatedProbability(
  context: string[],
  word: string,
  counts: AllCounts,
  lambdas: LambdaWeights,
  k: number
): number {
  const p1 = smoothedConditional([], word, counts, 1, k);
  const p2 = smoothedConditional(context, word, counts, 2, k);
  const p3 = smoothedConditional(context, word, counts, 3, k);
  const p4 = smoothedConditional(context, word, counts, 4, k);
  return (
    lambdas.unigram * p1 +
    lambdas.bigram * p2 +
    lambdas.trigram * p3 +
    lambdas.fourgram * p4
  );
}

/**
 * Validate that lambdas sum to 1 (within a small tolerance).
 */
export function lambdasValid(l: LambdaWeights): boolean {
  const s = l.unigram + l.bigram + l.trigram + l.fourgram;
  return Math.abs(s - 1) < 1e-6;
}

/**
 * Normalize an arbitrary lambda set so it sums to 1.
 */
export function normalizeLambdas(l: LambdaWeights): LambdaWeights {
  const s = l.unigram + l.bigram + l.trigram + l.fourgram;
  if (s === 0) return { unigram: 0.25, bigram: 0.25, trigram: 0.25, fourgram: 0.25 };
  return {
    unigram: l.unigram / s,
    bigram: l.bigram / s,
    trigram: l.trigram / s,
    fourgram: l.fourgram / s,
  };
}
