// lib/report.ts
// Build a markdown experiment report from the current Zustand state.

import type {
  ExperimentReport,
  ModelResult,
  PreprocessOptions,
  PreprocessResult,
  DatasetSplit,
  LambdaWeights,
} from "@/types/nlp";

export interface BuildReportArgs {
  preprocessed: PreprocessResult | null;
  preprocessOptions: PreprocessOptions;
  split: DatasetSplit | null;
  lm1Result: ModelResult | null;
  lm2Result: ModelResult | null;
  bestHyperparameters:
    | { lambdas: LambdaWeights; k: number; perplexity: number }
    | null;
  generatedExamples: string[];
}

export function buildReport(args: BuildReportArgs): ExperimentReport {
  return {
    corpusSummary: {
      characters: args.preprocessed?.rawText.length ?? 0,
      words: args.preprocessed?.tokens.length ?? 0,
      sentences:
        args.preprocessed?.tokens.filter((t) => t === args.preprocessOptions.endToken)
          .length ?? 0,
      vocabSize: args.preprocessed?.vocabulary.length ?? 0,
    },
    preprocessing: args.preprocessOptions,
    split: {
      train: args.split?.train.length ?? 0,
      validation: args.split?.validation.length ?? 0,
      test: args.split?.test.length ?? 0,
    },
    modelResults: [args.lm1Result, args.lm2Result].filter(Boolean) as ModelResult[],
    bestHyperparameters: args.bestHyperparameters ?? undefined,
    generatedExamples: args.generatedExamples,
    createdAt: new Date().toISOString(),
  };
}

export function reportToMarkdown(report: ExperimentReport): string {
  const lines: string[] = [];
  lines.push("# NGramLab — Experiment Report\n");
  lines.push(`_Generated ${report.createdAt}_\n`);
  lines.push("## 1. Corpus Summary\n");
  lines.push(`- Characters: **${report.corpusSummary.characters.toLocaleString()}**`);
  lines.push(`- Tokens: **${report.corpusSummary.words.toLocaleString()}**`);
  lines.push(`- Sentences: **${report.corpusSummary.sentences.toLocaleString()}**`);
  lines.push(`- Vocabulary size: **${report.corpusSummary.vocabSize.toLocaleString()}**\n`);

  lines.push("## 2. Preprocessing\n");
  const p = report.preprocessing;
  lines.push(`- Lowercase: ${p.lowercase}`);
  lines.push(`- Keep punctuation: ${p.keepPunctuation}`);
  lines.push(`- Sentence boundaries: ${p.addSentenceBoundaries}`);
  lines.push(`- Vocab cap: ${p.vocabSize === 0 ? "none" : p.vocabSize}`);
  lines.push(`- Unknown token: \`${p.unkToken}\`\n`);

  lines.push("## 3. Dataset Split\n");
  lines.push(`- Train tokens: **${report.split.train.toLocaleString()}**`);
  lines.push(`- Validation tokens: **${report.split.validation.toLocaleString()}**`);
  lines.push(`- Test tokens: **${report.split.test.toLocaleString()}**\n`);

  lines.push("## 4. LM1 — Backoff 4-Gram\n");
  lines.push(
    "An unsmoothed 4-gram language model that falls back to lower orders (trigram → bigram → unigram) when the higher-order n-gram is unseen in training. Useful as a baseline but vulnerable to zero probabilities on rare contexts."
  );
  lines.push("");

  lines.push("## 5. LM2 — Interpolation with Add-k Smoothing\n");
  lines.push(
    "A linear interpolation of unigram, bigram, trigram, and 4-gram probabilities, each smoothed with add-k. The mixing weights λ₁…λ₄ sum to 1 and the smoothing constant k > 0 keeps every probability strictly positive."
  );
  if (report.bestHyperparameters) {
    const h = report.bestHyperparameters;
    lines.push("\n**Best hyperparameters (validation):**");
    lines.push(`- λ₁ unigram = ${h.lambdas.unigram.toFixed(2)}`);
    lines.push(`- λ₂ bigram = ${h.lambdas.bigram.toFixed(2)}`);
    lines.push(`- λ₃ trigram = ${h.lambdas.trigram.toFixed(2)}`);
    lines.push(`- λ₄ 4-gram = ${h.lambdas.fourgram.toFixed(2)}`);
    lines.push(`- k = ${h.k}`);
    lines.push(`- Validation perplexity = **${h.perplexity.toFixed(2)}**`);
  }
  lines.push("");

  lines.push("## 6. Test Perplexity\n");
  lines.push("| Model | Method | Smoothing | Perplexity |");
  lines.push("|-------|--------|-----------|------------|");
  for (const r of report.modelResults) {
    lines.push(
      `| ${r.name} | ${r.method} | ${r.smoothing} | ${isFinite(r.perplexity) ? r.perplexity.toFixed(2) : "∞"} |`
    );
  }
  lines.push("");

  if (report.generatedExamples.length > 0) {
    lines.push("## 7. Generated Text Examples\n");
    for (const ex of report.generatedExamples) {
      lines.push(`> ${ex}\n`);
    }
  }

  lines.push("## 8. Conclusion\n");
  const lm1 = report.modelResults.find((r) => r.name === "LM1");
  const lm2 = report.modelResults.find((r) => r.name === "LM2");
  if (lm1 && lm2) {
    if (lm2.perplexity < lm1.perplexity) {
      lines.push(
        `LM2 achieved a lower perplexity (${lm2.perplexity.toFixed(2)}) than LM1 (${isFinite(lm1.perplexity) ? lm1.perplexity.toFixed(2) : "∞"}). Add-k smoothing combined with interpolation prevents zero probabilities on unseen n-grams while still benefiting from higher-order context, which explains the improvement.`
      );
    } else {
      lines.push(
        `LM1 produced a competitive result, but LM2 is more robust whenever the test set contains n-grams that did not appear during training, since add-k smoothing guarantees nonzero probabilities.`
      );
    }
  }
  return lines.join("\n");
}
