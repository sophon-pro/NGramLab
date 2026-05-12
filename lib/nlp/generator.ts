// lib/nlp/generator.ts
// Text generation for both LM1 (backoff) and LM2 (interpolation).
// Supports greedy / weighted-random / top-k sampling with temperature.

import type {
  AllCounts,
  GenerationOptions,
  GenerationResult,
  GenerationStep,
  LambdaWeights,
  Tokens,
} from "@/types/nlp";
import { getBackoffProbability } from "./backoff";
import { getInterpolatedProbability } from "./interpolation";

export type ScoreFn = (context: string[], word: string) => number;

export function makeBackoffScorer(counts: AllCounts): ScoreFn {
  return (ctx, w) => getBackoffProbability(ctx, w, counts);
}

export function makeInterpolationScorer(
  counts: AllCounts,
  lambdas: LambdaWeights,
  k: number
): ScoreFn {
  return (ctx, w) => getInterpolatedProbability(ctx, w, counts, lambdas, k);
}

/**
 * Apply temperature to a probability distribution and renormalize.
 * t < 1 sharpens, t > 1 flattens. Implemented as p^(1/t).
 */
function applyTemperature(probs: number[], t: number): number[] {
  const safeT = t <= 0 ? 1e-3 : t;
  const adj = probs.map((p) => Math.pow(Math.max(p, 1e-30), 1 / safeT));
  const sum = adj.reduce((s, x) => s + x, 0);
  if (sum <= 0) return probs;
  return adj.map((x) => x / sum);
}

function weightedSample(words: string[], probs: number[]): number {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r <= cum) return i;
  }
  return probs.length - 1;
}

/**
 * Tokenize a seed string the same way our preprocessor does at runtime.
 * Kept intentionally lightweight so generation is fast in the browser.
 */
function tokenizeSeed(seed: string): Tokens {
  return seed
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\-]+/gu, " ")
    .split(/\s+/g)
    .filter(Boolean);
}

/**
 * generateText — produce a sequence using the chosen scoring function.
 */
export function generateText(
  seedText: string,
  vocabulary: string[],
  score: ScoreFn,
  options: GenerationOptions,
  endToken = "</s>",
  startToken = "<s>"
): GenerationResult {
  // Build initial context: prepend start tokens to fill up to 3 history slots.
  let seedTokens = tokenizeSeed(seedText);
  let context: Tokens = [startToken, startToken, startToken, ...seedTokens];

  // Candidate words to score — exclude start tokens from being generated.
  const candidates = vocabulary.filter((w) => w !== startToken);

  const steps: GenerationStep[] = [];
  const generated: Tokens = [];

  for (let i = 0; i < options.maxWords; i++) {
    const lastThree = context.slice(-3);
    // Score every candidate word, then build a distribution.
    const rawProbs = candidates.map((w) => score(lastThree, w));
    const sum = rawProbs.reduce((s, x) => s + x, 0);
    if (sum <= 0) break;
    const norm = rawProbs.map((x) => x / sum);
    const tempered = applyTemperature(norm, options.temperature);

    let pick: number;
    if (options.strategy === "greedy") {
      let best = 0;
      for (let j = 1; j < tempered.length; j++) if (tempered[j] > tempered[best]) best = j;
      pick = best;
    } else if (options.strategy === "top-k") {
      // Keep only the top-K candidates, renormalize, then sample.
      const idx = tempered
        .map((p, j) => ({ p, j }))
        .sort((a, b) => b.p - a.p)
        .slice(0, Math.max(1, options.topK));
      const sub = idx.map((x) => x.p);
      const subSum = sub.reduce((s, x) => s + x, 0);
      const subNorm = sub.map((x) => x / (subSum || 1));
      const chosen = weightedSample(
        idx.map((x) => candidates[x.j]),
        subNorm
      );
      pick = idx[chosen].j;
    } else {
      // Weighted random over the full vocabulary.
      pick = weightedSample(candidates, tempered);
    }

    const word = candidates[pick];
    steps.push({
      step: i + 1,
      context: lastThree.join(" "),
      selectedWord: word,
      probability: tempered[pick],
    });

    if (word === endToken) break;
    generated.push(word);
    context.push(word);
  }

  // Clean output: strip out boundary tokens from the visible string.
  const visible = generated.filter((w) => w !== startToken && w !== endToken);
  // Prepend the seed back so users see the full continuation.
  const fullText = [...seedTokens, ...visible].join(" ");
  return { generatedText: fullText, steps };
}
