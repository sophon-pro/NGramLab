// lib/nlp/perplexity.ts
// Perplexity = exp(-1/N * Σ log P(w_i | context)).
// Uses log-space accumulation to avoid underflow.

import type { AllCounts, LambdaWeights, Tokens } from "@/types/nlp";
import { getBackoffProbability } from "./backoff";
import { getInterpolatedProbability } from "./interpolation";

const LOG_EPS = -50; // floor in log-space, equivalent to ~2e-22 probability.

function safeLog(p: number): number {
  if (!isFinite(p) || p <= 0) return LOG_EPS;
  const lp = Math.log(p);
  return Math.max(lp, LOG_EPS);
}

/**
 * Average negative log probability and perplexity for the backoff model.
 */
export function perplexityBackoff(
  testTokens: Tokens,
  counts: AllCounts,
  epsilon = 1e-10
): { perplexity: number; avgLogProb: number; N: number } {
  if (testTokens.length < 4) {
    return { perplexity: Infinity, avgLogProb: 0, N: 0 };
  }
  let sumLog = 0;
  let N = 0;
  for (let i = 3; i < testTokens.length; i++) {
    const context = testTokens.slice(i - 3, i);
    const word = testTokens[i];
    const p = getBackoffProbability(context, word, counts, { epsilon });
    sumLog += safeLog(p);
    N += 1;
  }
  const avg = sumLog / Math.max(N, 1);
  return { perplexity: Math.exp(-avg), avgLogProb: avg, N };
}

/**
 * Perplexity for the interpolated, add-k smoothed model.
 */
export function perplexityInterpolation(
  testTokens: Tokens,
  counts: AllCounts,
  lambdas: LambdaWeights,
  k: number
): { perplexity: number; avgLogProb: number; N: number } {
  if (testTokens.length < 4) {
    return { perplexity: Infinity, avgLogProb: 0, N: 0 };
  }
  let sumLog = 0;
  let N = 0;
  for (let i = 3; i < testTokens.length; i++) {
    const context = testTokens.slice(i - 3, i);
    const word = testTokens[i];
    const p = getInterpolatedProbability(context, word, counts, lambdas, k);
    sumLog += safeLog(p);
    N += 1;
  }
  const avg = sumLog / Math.max(N, 1);
  return { perplexity: Math.exp(-avg), avgLogProb: avg, N };
}
