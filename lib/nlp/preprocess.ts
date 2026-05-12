// lib/nlp/preprocess.ts
// Tokenization, normalization, sentence-boundary insertion, vocab limiting, and <UNK> substitution.

import type {
  PreprocessOptions,
  PreprocessResult,
  Tokens,
} from "@/types/nlp";

export const DEFAULT_PREPROCESS_OPTIONS: PreprocessOptions = {
  lowercase: true,
  removeExtraSpaces: true,
  keepPunctuation: false,
  addSentenceBoundaries: true,
  vocabSize: 1000,
  unkToken: "<UNK>",
  startToken: "<s>",
  endToken: "</s>",
};

/**
 * Split a normalized text into sentences using a simple regex.
 * Keeps things deterministic and dependency-free.
 */
function splitSentences(text: string): string[] {
  // Split on .!? followed by whitespace, keep the punctuation intact.
  // Falls back to single-sentence if no terminators present.
  const parts = text
    .split(/(?<=[.!?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

/**
 * Tokenize a single sentence into word tokens. We keep apostrophes inside
 * words (don't, it's) but otherwise treat punctuation as its own token
 * (or strip it depending on options).
 */
function tokenizeSentence(sentence: string, keepPunctuation: boolean): Tokens {
  const cleaned = keepPunctuation
    ? sentence.replace(/([.,!?;:"()\[\]])/g, " $1 ")
    : sentence.replace(/[^\p{L}\p{N}'\-]+/gu, " ");
  return cleaned
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * preprocessText — primary entry point. Returns the cleaned token stream
 * along with vocabulary, frequencies, and a summary of UNK replacement.
 */
export function preprocessText(
  rawText: string,
  options: PreprocessOptions
): PreprocessResult {
  let text = rawText;

  if (options.lowercase) text = text.toLowerCase();
  if (options.removeExtraSpaces) text = text.replace(/\s+/g, " ").trim();

  const sentences = splitSentences(text);
  let flat: Tokens = [];
  for (const s of sentences) {
    const toks = tokenizeSentence(s, options.keepPunctuation);
    if (toks.length === 0) continue;
    if (options.addSentenceBoundaries) {
      flat.push(options.startToken, ...toks, options.endToken);
    } else {
      flat.push(...toks);
    }
  }

  // Frequency count.
  const freq: Record<string, number> = {};
  for (const t of flat) freq[t] = (freq[t] ?? 0) + 1;
  const uniqueBefore = Object.keys(freq).length;

  // Vocab limiting: keep top-N words. Sentence boundary + UNK tokens are
  // always retained, regardless of count or limit.
  const reserved = new Set([
    options.startToken,
    options.endToken,
    options.unkToken,
  ]);

  let keep: Set<string>;
  if (options.vocabSize > 0 && options.vocabSize < uniqueBefore) {
    const sorted = Object.entries(freq)
      .filter(([w]) => !reserved.has(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.max(0, options.vocabSize - reserved.size))
      .map(([w]) => w);
    keep = new Set([...reserved, ...sorted]);
  } else {
    keep = new Set([...Object.keys(freq), ...reserved]);
  }

  // Replace OOV with <UNK>.
  let unkReplacements = 0;
  const tokens = flat.map((t) => {
    if (keep.has(t)) return t;
    unkReplacements += 1;
    return options.unkToken;
  });

  // Recompute frequencies on the final stream so the vocabulary list
  // matches what downstream models actually see.
  const finalFreq: Record<string, number> = {};
  for (const t of tokens) finalFreq[t] = (finalFreq[t] ?? 0) + 1;
  const vocabulary = Object.keys(finalFreq).sort(
    (a, b) => finalFreq[b] - finalFreq[a]
  );

  return {
    rawText,
    tokens,
    vocabulary,
    freq: finalFreq,
    uniqueBefore,
    uniqueAfter: vocabulary.length,
    unkReplacements,
  };
}

/**
 * Quick stats helper for the Corpus page (works on raw text, not tokens).
 */
export function rawCorpusStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/g).length : 0;
  const sentences = trimmed ? splitSentences(trimmed).length : 0;
  const unique = new Set(
    trimmed
      .toLowerCase()
      .replace(/[^\p{L}\p{N}'\-]+/gu, " ")
      .split(/\s+/g)
      .filter(Boolean)
  ).size;
  return {
    characters: text.length,
    words,
    sentences,
    uniqueWords: unique,
  };
}
