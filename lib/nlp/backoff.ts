// lib/nlp/backoff.ts
// LM1 — Katz-style 4-gram backoff. Falls back 4 -> 3 -> 2 -> 1.
// Each fallback step is scaled by alpha (default 0.4), matching the notebook
// implementation where lower-order probabilities are discounted to avoid
// over-crediting coarser estimates.

import type { AllCounts } from "@/types/nlp";

export interface BackoffOptions {
  /**
   * Discount factor applied at each fallback step (Katz alpha).
   * Trigram fallback → alpha·P_tri, bigram → alpha²·P_bi, unigram → alpha³·P_uni.
   * Default 0.4 matches the reference notebook.
   */
  alpha: number;
}

export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  alpha: 0.4,
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
  const { alpha } = options;

  // 4-gram: P(word | w-3 w-2 w-1)
  if (context.length >= 3) {
    const ctx3 = context.slice(-3).join(" ");
    const fullKey = ctx3 + " " + word;
    const ctxCount = counts.fourgrams.contextCounts.get(ctx3) ?? 0;
    const ngramCount = counts.fourgrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return ngramCount / ctxCount;
  }
  // Trigram backoff: alpha · P(word | w-2 w-1)
  if (context.length >= 2) {
    const ctx2 = context.slice(-2).join(" ");
    const fullKey = ctx2 + " " + word;
    const ctxCount = counts.trigrams.contextCounts.get(ctx2) ?? 0;
    const ngramCount = counts.trigrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return alpha * (ngramCount / ctxCount);
  }
  // Bigram backoff: alpha² · P(word | w-1)
  if (context.length >= 1) {
    const ctx1 = context.slice(-1).join(" ");
    const fullKey = ctx1 + " " + word;
    const ctxCount = counts.bigrams.contextCounts.get(ctx1) ?? 0;
    const ngramCount = counts.bigrams.ngramCounts.get(fullKey) ?? 0;
    if (ngramCount > 0 && ctxCount > 0) return alpha * alpha * (ngramCount / ctxCount);
  }
  // Unigram fallback: alpha³ · add-1-smoothed P(word)
  // Add-1 smoothing ensures a positive floor even for unseen tokens.
  const uniCount = counts.unigrams.ngramCounts.get(word) ?? 0;
  const N = counts.totalUnigrams;
  const V = counts.vocabulary.length;
  return alpha * alpha * alpha * (uniCount + 1) / (N + V);
}
