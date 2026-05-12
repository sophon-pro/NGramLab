// lib/nlp/backoff.ts
// LM1 — Unsmoothed 4-gram backoff. Falls back 4 -> 3 -> 2 -> 1 -> epsilon.

import type { AllCounts } from "@/types/nlp";

export interface BackoffOptions {
  /**
   * Probability returned when even the unigram count is zero. Keeping this
   * as a tiny positive number prevents log(0) blowups, but the user can
   * set it to 0 to demonstrate "true unsmoothed" behavior on the LM1 card.
   */
  epsilon: number;
}

export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  epsilon: 1e-10,
};

/**
 * Conditional probability under the backoff model.
 *
 * Context is the *previous tokens*, target is the word we want the prob of.
 * For a 4-gram model the context is the previous 3 tokens.
 */
export function getBackoffProbability(
  context: string[],
  word: string,
  counts: AllCounts,
  options: BackoffOptions = DEFAULT_BACKOFF_OPTIONS
): number {
  // 4-gram: P(word | w-3 w-2 w-1)
  if (context.length >= 3) {
    const ctx3 = context.slice(-3).join(" ");
    const fullKey = ctx3 + " " + word;
    const ctxCount = counts.fourgrams.contextCounts.get(ctx3) ?? 0;
    const ngramCount = counts.fourgrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return ngramCount / ctxCount;
  }
  // Trigram backoff: P(word | w-2 w-1)
  if (context.length >= 2) {
    const ctx2 = context.slice(-2).join(" ");
    const fullKey = ctx2 + " " + word;
    const ctxCount = counts.trigrams.contextCounts.get(ctx2) ?? 0;
    const ngramCount = counts.trigrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return ngramCount / ctxCount;
  }
  // Bigram backoff: P(word | w-1)
  if (context.length >= 1) {
    const ctx1 = context.slice(-1).join(" ");
    const fullKey = ctx1 + " " + word;
    const ctxCount = counts.bigrams.contextCounts.get(ctx1) ?? 0;
    const ngramCount = counts.bigrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return ngramCount / ctxCount;
  }
  // Unigram fallback: P(word)
  const uniCount = counts.unigrams.ngramCounts.get(word) ?? 0;
  if (uniCount > 0 && counts.totalUnigrams > 0) {
    return uniCount / counts.totalUnigrams;
  }
  // Final fallback for truly unseen tokens.
  return options.epsilon;
}
