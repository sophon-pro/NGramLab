"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Database,
  GitBranch,
  Layers,
  Loader2,
  PlayCircle,
  Sparkles,
  TrendingDown,
  Wand2,
} from "lucide-react";
import { Button, Card, CardContent, FadeIn } from "@/components/ui/primitives";
import { SAMPLE_CORPORA } from "@/lib/sample-corpus";
import { DEFAULT_PREPROCESS_OPTIONS, preprocessText } from "@/lib/nlp/preprocess";
import { splitDataset } from "@/lib/nlp/split";
import { buildAllCounts } from "@/lib/nlp/ngrams";
import {
  perplexityBackoff,
  perplexityInterpolation,
} from "@/lib/nlp/perplexity";
import { generateText, makeInterpolationScorer } from "@/lib/nlp/generator";
import { useExperiment } from "@/lib/store/experiment";
import type { LambdaWeights } from "@/types/nlp";

const LAMBDA_PRESETS: { name: string; lambdas: LambdaWeights }[] = [
  {
    name: "Heavy 4-gram",
    lambdas: { unigram: 0.05, bigram: 0.15, trigram: 0.3, fourgram: 0.5 },
  },
  {
    name: "Balanced",
    lambdas: { unigram: 0.1, bigram: 0.2, trigram: 0.3, fourgram: 0.4 },
  },
  {
    name: "Uniform",
    lambdas: { unigram: 0.25, bigram: 0.25, trigram: 0.25, fourgram: 0.25 },
  },
  {
    name: "Heavy unigram",
    lambdas: { unigram: 0.4, bigram: 0.3, trigram: 0.2, fourgram: 0.1 },
  },
];

const K_VALUES = [0.01, 0.05, 0.1, 0.5, 1.0];

const PIPELINE = [
  { label: "Corpus", icon: BookOpen },
  { label: "Tokenize", icon: Layers },
  { label: "Limit vocab", icon: Database },
  { label: "Train 4-gram", icon: GitBranch },
  { label: "Perplexity", icon: TrendingDown },
  { label: "Generate", icon: Sparkles },
];

export default function FourGramHomePage() {
  const router = useRouter();
  const store = useExperiment();
  const [demoState, setDemoState] = useState<"idle" | "running" | "done">("idle");
  const [demoStep, setDemoStep] = useState("");

  async function runFullDemo() {
    setDemoState("running");
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    setDemoStep("Loading sample corpus...");
    await sleep(80);
    const corpus = SAMPLE_CORPORA[0];
    store.setRawText(corpus.text);

    setDemoStep("Tokenizing and building vocabulary...");
    await sleep(80);
    const opts = { ...DEFAULT_PREPROCESS_OPTIONS, vocabSize: 1000 };
    store.setPreprocessOptions(opts);
    const pre = preprocessText(corpus.text, opts);
    store.setPreprocessed(pre);

    setDemoStep("Splitting train / validation / test...");
    await sleep(80);
    const split = splitDataset(pre.tokens, 0.7, 0.1, 0.2);
    store.setSplit(split);

    setDemoStep("Counting n-grams...");
    await sleep(80);
    const counts = buildAllCounts(split.train, pre.vocabulary);
    store.setCounts(counts);

    setDemoStep("Evaluating LM1...");
    await sleep(60);
    const valPP1 = perplexityBackoff(split.validation, counts).perplexity;
    store.setLM1Result({
      name: "LM1 Backoff",
      method: "backoff",
      smoothing: "none",
      perplexity: valPP1,
      settings: { dataset: "validation" },
    });

    setDemoStep("Tuning LM2...");
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
        if (pp < best.perplexity) best = { lambdas: preset.lambdas, k, perplexity: pp };
      }
    }
    store.setBestHyperparameters(best);
    store.setLambdas(best.lambdas);
    store.setK(best.k);

    setDemoStep("Evaluating on test set...");
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
      settings: { dataset: "test", k: best.k, lambdas: best.lambdas },
    });
    store.setTrainedAt(new Date().toISOString());

    setDemoStep("Generating example text...");
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

    setDemoStep("Done. Opening dashboard...");
    await sleep(300);
    setDemoState("done");
    router.push("/4gram/dashboard");
  }

  return (
    <div className="relative">
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
          <FadeIn className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-3 py-1 text-xs font-medium text-ink-600 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              4Gram Interactive Demo
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              4-Gram Language Models
              <br className="hidden md:block" /> in your browser.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-ink-600 dark:text-ink-300 md:text-lg">
              Train, tune, and evaluate a classical 4-gram text generator. Compare
              backoff with interpolation, inspect perplexity, and watch generated
              text form one word at a time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/4gram/corpus">
                <Button size="lg">
                  Start Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={runFullDemo}
                disabled={demoState === "running"}
                className="border-violet-400/60 bg-violet-500/15 text-violet-800 hover:bg-violet-500/25 hover:text-violet-950 dark:border-violet-400/50 dark:bg-violet-500/20 dark:text-violet-100 dark:hover:bg-violet-500/30"
              >
                {demoState === "running" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {demoStep || "Running..."}
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" /> Run full demo
                  </>
                )}
              </Button>
              <Link href="/4gram/explain">
                <Button size="lg" variant="outline">
                  <BookOpen className="h-4 w-4" /> View Methodology
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-14">
            <Card className="overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="mb-5 text-center text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">
                  Pipeline
                </div>
                <div className="mx-auto grid max-w-6xl grid-cols-[repeat(11,minmax(0,1fr))] items-center gap-2">
                  {PIPELINE.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="contents">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ink-100 to-ink-200 text-accent-600 ring-1 ring-inset ring-ink-200/60 dark:from-ink-800 dark:to-ink-900 dark:text-accent-300 dark:ring-ink-800/80">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-center font-mono text-[11px] text-ink-600 dark:text-ink-300 md:text-xs">
                            {step.label}
                          </div>
                        </div>
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

          <FadeIn delay={0.2} className="mt-8 grid gap-4 md:grid-cols-2">
            <MethodPreview
              label="LM1 Backoff"
              title="Shorter context fallback"
              text="When a 4-gram is unseen, LM1 backs off to trigram, bigram, then unigram counts."
            />
            <MethodPreview
              label="LM2 Interpolation"
              title="Weighted mixture with smoothing"
              text="LM2 mixes all n-gram orders with add-k smoothing, so unseen contexts still receive probability."
            />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function MethodPreview({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-widest text-accent-700 dark:text-accent-300">
          {label}
        </div>
        <h2 className="mt-2 font-display text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
          {text}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-600 dark:text-ink-300">
          <Wand2 className="h-4 w-4 text-accent-600 dark:text-accent-300" />
          Inspect counts, probabilities, perplexity, and generated output.
        </div>
      </CardContent>
    </Card>
  );
}
