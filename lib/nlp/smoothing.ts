// lib/nlp/smoothing.ts
// Add-k smoothing formula: (count + k) / (contextCount + k * |V|)

/**
 * addKProbability — applies add-k (Laplace-style) smoothing for any n-gram order.
 * When count == 0, this still returns a positive probability so long as k > 0.
 *
 * @param ngramCount   Count of the full n-gram (context + target word).
 * @param contextCount Count of the (n-1)-gram context. For unigrams pass total tokens.
 * @param vocabSize    Vocabulary size |V| (used to keep the distribution normalized).
 * @param k            Smoothing constant (must be > 0).
 */
export function addKProbability(
  ngramCount: number,
  contextCount: number,
  vocabSize: number,
  k: number
): number {
  if (k <= 0) {
    // Without smoothing the formula reduces to MLE; protect against /0.
    if (contextCount === 0) return 0;
    return ngramCount / contextCount;
  }
  const denom = contextCount + k * vocabSize;
  if (denom === 0) return 0;
  return (ngramCount + k) / denom;
}
