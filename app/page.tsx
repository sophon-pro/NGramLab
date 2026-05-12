// app/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Database,
  GitBranch,
  Layers,
  Sparkles,
  TrendingDown,
  Wand2,
  FileText,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { Button, Card, CardContent, FadeIn } from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { SAMPLE_CORPORA } from "@/lib/sample-corpus";
import { preprocessText, DEFAULT_PREPROCESS_OPTIONS } from "@/lib/nlp/preprocess";
import { splitDataset } from "@/lib/nlp/split";
import { buildAllCounts } from "@/lib/nlp/ngrams";
import {
  perplexityBackoff,
  perplexityInterpolation,
} from "@/lib/nlp/perplexity";
import {
  generateText,
  makeInterpolationScorer,
} from "@/lib/nlp/generator";
import type { LambdaWeights } from "@/types/nlp";

const LAMBDA_PRESETS: { name: string; lambdas: LambdaWeights }[] = [
  { name: "Heavy 4-gram", lambdas: { unigram: 0.05, bigram: 0.15, trigram: 0.3, fourgram: 0.5 } },
  { name: "Balanced ↑", lambdas: { unigram: 0.1, bigram: 0.2, trigram: 0.3, fourgram: 0.4 } },
  { name: "Uniform", lambdas: { unigram: 0.25, bigram: 0.25, trigram: 0.25, fourgram: 0.25 } },
  { name: "Heavy unigram", lambdas: { unigram: 0.4, bigram: 0.3, trigram: 0.2, fourgram: 0.1 } },
];
const K_VALUES = [0.01, 0.05, 0.1, 0.5, 1.0];

const HIGHLIGHTS = [
  {
    icon: Layers,
    title: "Train 4-gram models",
    desc: "Build full unigram → 4-gram count tables from any corpus in the browser.",
  },
  {
    icon: GitBranch,
    title: "Backoff vs interpolation",
    desc: "Side-by-side comparison of LM1 (backoff) and LM2 (interpolation + add-k).",
  },
  {
    icon: Wand2,
    title: "Tunable smoothing",
    desc: "Sweep λ weights and k to find the configuration that minimizes perplexity.",
  },
  {
    icon: Sparkles,
    title: "Interactive generation",
    desc: "Greedy, weighted-random, and top-k sampling with temperature control.",
  },
  {
    icon: TrendingDown,
    title: "Perplexity evaluation",
    desc: "Log-space evaluation on a held-out test set with visual model comparison.",
  },
  {
    icon: FileText,
    title: "Auto report export",
    desc: "Generate a Markdown / JSON report suitable for a 4-page academic write-up.",
  },
];

const PIPELINE = [
  { label: "Corpus", icon: BookOpen },
  { label: "Tokenize", icon: Layers },
  { label: "Limit vocab", icon: Database },
  { label: "Train 4-gram", icon: GitBranch },
  { label: "Perplexity", icon: TrendingDown },
  { label: "Generate", icon: Sparkles },
];

export default function HomePage() {
  const router = useRouter();
  const [demoState, setDemoState] = useState<"idle" | "running" | "done">("idle");
  const [demoStep, setDemoStep] = useState<string>("");
  const store = useExperiment();

  async function runFullDemo() {
    setDemoState("running");
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // 1. Load sample corpus
    setDemoStep("Loading sample corpus…");
    await sleep(80);
    const corpus = SAMPLE_CORPORA[0];
    store.setRawText(corpus.text);

    // 2. Preprocess
    setDemoStep("Tokenizing & building vocabulary…");
    await sleep(80);
    const opts = { ...DEFAULT_PREPROCESS_OPTIONS, vocabSize: 1000 };
    store.setPreprocessOptions(opts);
    const pre = preprocessText(corpus.text, opts);
    store.setPreprocessed(pre);

    // 3. Split
    setDemoStep("Splitting train / val / test…");
    await sleep(80);
    const split = splitDataset(pre.tokens, 0.7, 0.1, 0.2);
    store.setSplit(split);

    // 4. Build n-gram counts
    setDemoStep("Counting n-grams (1 → 4)…");
    await sleep(80);
    const counts = buildAllCounts(split.train, pre.vocabulary);
    store.setCounts(counts);

    // 5. Train LM1 (validation perplexity)
    setDemoStep("Evaluating LM1 (backoff) on validation…");
    await sleep(60);
    const valPP1 = perplexityBackoff(split.validation, counts).perplexity;
    store.setLM1Result({
      name: "LM1 Backoff",
      method: "backoff",
      smoothing: "none",
      perplexity: valPP1,
      settings: { dataset: "validation" },
    });

    // 6. Tune LM2 — sweep λ × k on validation
    setDemoStep("Tuning LM2 (20-config sweep)…");
    await sleep(60);
    let best = {
      lambdas: LAMBDA_PRESETS[0].lambdas,
      k: 0.1,
      perplexity: Infinity,
    };
    for (const preset of LAMBDA_PRESETS) {
      for (const k of K_VALUES) {
        const pp = perplexityInterpolation(
          split.validation,
          counts,
          preset.lambdas,
          k
        ).perplexity;
        if (pp < best.perplexity) {
          best = { lambdas: preset.lambdas, k, perplexity: pp };
        }
      }
    }
    store.setBestHyperparameters(best);
    store.setLambdas(best.lambdas);
    store.setK(best.k);

    // 7. Evaluate both models on TEST split
    setDemoStep("Evaluating on test set…");
    await sleep(60);
    const testPP1 = perplexityBackoff(split.test, counts).perplexity;
    const testPP2 = perplexityInterpolation(
      split.test,
      counts,
      best.lambdas,
      best.k
    ).perplexity;
    store.setLM1Result({
      name: "LM1 Backoff",
      method: "backoff",
      smoothing: "none",
      perplexity: testPP1,
      settings: { dataset: "test" },
    });
    store.setLM2Result({
      name: "LM2 Interpolation",
      method: "interpolation",
      smoothing: "add-k",
      perplexity: testPP2,
      settings: {
        dataset: "test",
        k: best.k,
        lambdas: best.lambdas,
      },
    });
    store.setTrainedAt(new Date().toISOString());

    // 8. Generate an example
    setDemoStep("Generating example text…");
    await sleep(60);
    const scorer = makeInterpolationScorer(counts, best.lambdas, best.k);
    const gen = generateText("the model", pre.vocabulary, scorer, {
      maxWords: 30,
      temperature: 0.9,
      topK: 10,
      strategy: "weighted",
    });
    store.addGeneratedExample(gen.generatedText);
    store.setLastGenerationSteps(gen.steps);

    setDemoStep("Done — opening dashboard…");
    await sleep(300);
    setDemoState("done");
    router.push("/dashboard");
  }

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <FadeIn className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white/60 dark:bg-ink-900/60 px-3 py-1 text-xs font-medium text-ink-600 dark:text-ink-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
              Mini Project - Text Generation
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Interactive{" "}
              <span className="bg-gradient-to-r from-accent-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                4-Gram
              </span>
              <br className="hidden md:block" /> Language Models
              <br className="hidden md:block" /> in your browser.
            </h1>
            <p className="mt-5 text-ink-600 dark:text-ink-300 text-base md:text-lg max-w-2xl">
              NGramLab lets you train, tune, and evaluate two classical 4-gram
              models — a <strong>backoff</strong> model and an{" "}
              <strong>interpolated, add-k smoothed</strong> model — and watch
              them generate text in real time. No backend. No API keys. Just
              math and a corpus.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/corpus">
                <Button size="lg">
                  Start Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explain">
                <Button size="lg" variant="outline">
                  <BookOpen className="h-4 w-4" /> View Methodology
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                onClick={runFullDemo}
                disabled={demoState === "running"}
              >
                {demoState === "running" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {demoStep || "Running…"}
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" /> Run full demo
                  </>
                )}
              </Button>
            </div>
          </FadeIn>

          {/* Pipeline */}
          <FadeIn delay={0.15} className="mt-16">
            <Card className="overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-4">
                  Pipeline
                </div>
                <div className="grid grid-flow-col auto-cols-[minmax(96px,1fr)] items-center gap-3 overflow-x-auto scrollbar-thin pb-2 md:grid-cols-[repeat(11,minmax(0,1fr))] md:auto-cols-auto md:gap-0">
                  {PIPELINE.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="contents">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * idx + 0.3 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ink-100 to-ink-200 dark:from-ink-800 dark:to-ink-900 text-accent-600 dark:text-accent-300 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="font-mono text-[11px] md:text-xs text-ink-600 dark:text-ink-300 text-center">
                            {step.label}
                          </div>
                        </motion.div>
                        {idx < PIPELINE.length - 1 && (
                          <div className="flex items-center justify-center text-ink-300 dark:text-ink-700">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Highlights */}
      <section
        id="about-project"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24"
      >
        <FadeIn>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            What you can do
          </h2>
          <p className="text-ink-500 dark:text-ink-400 mt-2 max-w-2xl">
            Every page of the lab corresponds to one stage of the NLP pipeline,
            and every parameter is exposed.
          </p>
        </FadeIn>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h, idx) => {
            const Icon = h.icon;
            return (
              <FadeIn key={h.title} delay={0.04 * idx}>
                <Card className="card-lift h-full">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/10 text-accent-600 dark:text-accent-300 mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">
                      {h.title}
                    </h3>
                    <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                      {h.desc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Method preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-widest text-accent-600 dark:text-accent-300 font-medium">
                  LM1 · Backoff
                </div>
                <h3 className="font-display text-xl font-semibold mt-2">
                  4-gram → trigram → bigram → unigram
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                  An unsmoothed 4-gram model that falls back to lower orders
                  whenever a higher-order n-gram is unseen in training. Simple
                  and transparent — but vulnerable to zero probabilities.
                </p>
                <pre className="mt-4 rounded-lg bg-ink-50 dark:bg-ink-950 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80 p-3 text-xs font-mono overflow-x-auto">
{`P(wᵢ | wᵢ₋₃, wᵢ₋₂, wᵢ₋₁)
 ↓ if unseen
P(wᵢ | wᵢ₋₂, wᵢ₋₁)
 ↓ if unseen
P(wᵢ | wᵢ₋₁)
 ↓ if unseen
P(wᵢ)`}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300 font-medium">
                  LM2 · Interpolation + add-k
                </div>
                <h3 className="font-display text-xl font-semibold mt-2">
                  Weighted mixture, no zeros
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                  A linear interpolation of all four orders, each smoothed with
                  add-k. Tune λ₁…λ₄ and k to minimize validation perplexity.
                </p>
                <pre className="mt-4 rounded-lg bg-ink-50 dark:bg-ink-950 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80 p-3 text-xs font-mono overflow-x-auto">
{`P(wᵢ | h) = λ₁ P₁(wᵢ)
          + λ₂ P₂(wᵢ | wᵢ₋₁)
          + λ₃ P₃(wᵢ | wᵢ₋₂, wᵢ₋₁)
          + λ₄ P₄(wᵢ | wᵢ₋₃, wᵢ₋₂, wᵢ₋₁)
P_k(wᵢ | h) = (count + k) / (Σ count + k|V|)`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
