// lib/nlp/ngrams.ts
// Build n-gram count maps and a packaged AllCounts object used by every model.

import type { AllCounts, NGramCounts, Tokens } from "@/types/nlp";

/**
 * createNGrams — slide a window of size n over the token stream.
 * Returns full-ngram counts AND context counts (n-1 prefix) so that
 * conditional probabilities can be computed without rescanning.
 */
export function createNGrams(tokens: Tokens, n: number): NGramCounts {
  const ngramCounts = new Map<string, number>();
  const contextCounts = new Map<string, number>();

  if (n < 1) throw new Error("n must be >= 1");
  if (tokens.length < n) {
    return { ngramCounts, contextCounts, n, totalNgrams: 0 };
  }

  let total = 0;
  for (let i = 0; i <= tokens.length - n; i++) {
    const window = tokens.slice(i, i + n);
    const ngramKey = window.join(" ");
    ngramCounts.set(ngramKey, (ngramCounts.get(ngramKey) ?? 0) + 1);
    total += 1;
    if (n > 1) {
      const ctxKey = window.slice(0, n - 1).join(" ");
      contextCounts.set(ctxKey, (contextCounts.get(ctxKey) ?? 0) + 1);
    }
  }
  // For unigrams there is no context, but we record the total count
  // under the empty-string key so downstream code can uniformly look it up.
  if (n === 1) contextCounts.set("", total);

  return { ngramCounts, contextCounts, n, totalNgrams: total };
}

/**
 * Convenience: build all four n-gram orders in one pass-equivalent.
 */
export function buildAllCounts(
  tokens: Tokens,
  vocabulary: string[]
): AllCounts {
  const unigrams = createNGrams(tokens, 1);
  const bigrams = createNGrams(tokens, 2);
  const trigrams = createNGrams(tokens, 3);
  const fourgrams = createNGrams(tokens, 4);
  const observed = new Set(tokens);
  const effectiveVocabulary = vocabulary.filter((token) => observed.has(token));

  if (observed.has("<UNK>") && !effectiveVocabulary.includes("<UNK>")) {
    effectiveVocabulary.push("<UNK>");
  }

  return {
    unigrams,
    bigrams,
    trigrams,
    fourgrams,
    totalUnigrams: unigrams.totalNgrams,
    vocabulary: effectiveVocabulary.length > 0 ? effectiveVocabulary : vocabulary,
  };
}

/**
 * Return the top-k most frequent ngrams from a count map.
 */
export function topNGrams(
  counts: NGramCounts,
  k = 20
): Array<{ ngram: string; count: number; probability: number }> {
  const entries = Array.from(counts.ngramCounts.entries());
  entries.sort((a, b) => b[1] - a[1]);
  const total = counts.totalNgrams;
  return entries.slice(0, k).map(([ngram, count]) => ({
    ngram,
    count,
    probability: total > 0 ? count / total : 0,
  }));
}
