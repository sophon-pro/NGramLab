// app/training/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Layers,
  Play,
  RotateCcw,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  Alert,
  Stat,
  Badge,
  FadeIn,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildAllCounts, topNGrams } from "@/lib/nlp/ngrams";
import { normalizeLambdas, lambdasValid } from "@/lib/nlp/interpolation";
import { perplexityBackoff, perplexityInterpolation } from "@/lib/nlp/perplexity";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: 1 | 2 | 3 | 4; label: string }> = [
  { id: 1, label: "Unigram" },
  { id: 2, label: "Bigram" },
  { id: 3, label: "Trigram" },
  { id: 4, label: "4-gram" },
];

export default function TrainingPage() {
  const {
    preprocessed,
    split,
    counts,
    setCounts,
    lambdas,
    setLambdas,
    k,
    setK,
    setLM1Result,
    setLM2Result,
    setTrainedAt,
  } = useExperiment();

  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(4);
  const [lm1Status, setLm1Status] = useState<"idle" | "training" | "done">(
    counts ? "done" : "idle"
  );
  const [lm2Status, setLm2Status] = useState<"idle" | "training" | "done">(
    counts ? "done" : "idle"
  );

  // Rebuild counts on mount if needed (they don't survive a page refresh
  // because Maps aren't persisted to localStorage).
  useEffect(() => {
    if (!counts && split && preprocessed) {
      const c = buildAllCounts(split.train, preprocessed.vocabulary);
      setCounts(c);
    }
  }, [counts, split, preprocessed, setCounts]);

  function trainLM1() {
    if (!split || !preprocessed) return;
    setLm1Status("training");
    // Defer to next tick so the spinner can render — training itself is fast.
    setTimeout(() => {
      let c = counts;
      if (!c) {
        c = buildAllCounts(split.train, preprocessed.vocabulary);
        setCounts(c);
      }
      const { perplexity } = perplexityBackoff(split.validation, c);
      setLM1Result({
        name: "LM1",
        method: "Backoff",
        smoothing: "None",
        perplexity,
        settings: {},
      });
      setTrainedAt(new Date().toISOString());
      setLm1Status("done");
    }, 60);
  }

  function trainLM2() {
    if (!split || !preprocessed) return;
    if (!lambdasValid(lambdas)) {
      setLambdas(normalizeLambdas(lambdas));
    }
    setLm2Status("training");
    setTimeout(() => {
      let c = counts;
      if (!c) {
        c = buildAllCounts(split.train, preprocessed.vocabulary);
        setCounts(c);
      }
      const { perplexity } = perplexityInterpolation(
        split.validation,
        c,
        lambdasValid(lambdas) ? lambdas : normalizeLambdas(lambdas),
        k
      );
      setLM2Result({
        name: "LM2",
        method: "Interpolation",
        smoothing: `add-k (k=${k})`,
        perplexity,
        settings: { lambdas, k },
      });
      setTrainedAt(new Date().toISOString());
      setLm2Status("done");
    }, 60);
  }

  const noData = !split || !preprocessed;

  const activeNGramStats = useMemo(() => {
    if (!counts) return null;
    const map =
      activeTab === 1
        ? counts.unigrams
        : activeTab === 2
          ? counts.bigrams
          : activeTab === 3
            ? counts.trigrams
            : counts.fourgrams;
    return {
      total: map.totalNgrams,
      unique: map.ngramCounts.size,
      top: topNGrams(map, 15),
    };
  }, [counts, activeTab]);

  const lambdaSum =
    lambdas.unigram + lambdas.bigram + lambdas.trigram + lambdas.fourgram;
  const lambdaOk = Math.abs(lambdaSum - 1) < 0.001;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Train models"
        description="Build the count tables and train both 4-gram language models."
        step={{ current: 4, total: 8 }}
      >
        <Link href="/4gram/tuning">
          <Button>
            Tune LM2 <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {noData && (
        <Alert variant="warn" className="mb-6">
          Need a preprocessed and split corpus first.{" "}
          <Link href="/4gram/split" className="underline">Split it now.</Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
      {/* N-gram counter */}
      <FadeIn className="lg:col-span-2 h-full">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>N-gram counts</CardTitle>
            <CardDescription>
              Computed from the training split. Switch tabs to see each order.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium border transition-colors",
                    activeTab === t.id
                      ? "border-accent-400 bg-accent-400/10 text-accent-700 dark:text-accent-300"
                      : "border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800/40"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeNGramStats ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <Stat label="Total" value={formatNumber(activeNGramStats.total)} />
                  <Stat label="Unique" value={formatNumber(activeNGramStats.unique)} />
                  <Stat label="Order" value={activeTab + "-gram"} />
                  <Stat
                    label="Train tokens"
                    value={formatNumber(split?.train.length ?? 0)}
                  />
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800">
                        <th className="py-2 pr-4">N-gram</th>
                        <th className="py-2 pr-4 text-right">Count</th>
                        <th className="py-2 pr-4 text-right">Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeNGramStats.top.map((row) => (
                        <tr
                          key={row.ngram}
                          className="border-b border-ink-100/60 dark:border-ink-800/60"
                        >
                          <td className="py-1.5 pr-4 font-mono">{row.ngram}</td>
                          <td className="py-1.5 pr-4 text-right font-mono">
                            {row.count}
                          </td>
                          <td className="py-1.5 pr-4 text-right font-mono text-ink-500 dark:text-ink-400">
                            {(row.probability * 100).toFixed(3)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-sm text-ink-500 dark:text-ink-400">
                Counts will appear once a corpus is split.
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Model cards */}
      <div className="space-y-6">
        {/* LM1 */}
        <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="accent" className="mb-2">LM1</Badge>
                  <CardTitle>Backoff 4-gram</CardTitle>
                  <CardDescription>
                    Try 4-gram → trigram → bigram → unigram. No smoothing.
                  </CardDescription>
                </div>
                <GitBranch className="h-6 w-6 text-accent-500" />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="rounded-md bg-ink-50 dark:bg-ink-950 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80 p-3 text-xs font-mono mb-4 overflow-x-auto">
{`if Count(w₋₃ w₋₂ w₋₁ wᵢ) > 0
   → P = Count(...) / Count(w₋₃ w₋₂ w₋₁)
else fall back to trigram   → α · P_tri
else fall back to bigram    → α² · P_bi
else fall back to unigram   → α³ · add-1 P_uni  (α = 0.4)`}
              </pre>

              <Alert variant="info" className="mb-4">
                Backoff discounts lower-order probabilities by α = 0.4 per step.
                The add-1 smoothed unigram floor keeps perplexity finite.
              </Alert>

              <div className="flex items-center gap-2">
                <Button
                  onClick={trainLM1}
                  disabled={noData || lm1Status === "training"}
                  className="flex-1"
                >
                  <Play className="h-4 w-4" />
                  {lm1Status === "training" ? "Training…" : "Train LM1"}
                </Button>
                {lm1Status === "done" && (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3" /> Trained
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* LM2 */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="violet" className="mb-2">LM2</Badge>
                  <CardTitle>Interpolation + add-k</CardTitle>
                  <CardDescription>
                    λ₁·P₁ + λ₂·P₂ + λ₃·P₃ + λ₄·P₄ with add-k smoothing on every term.
                  </CardDescription>
                </div>
                <Layers className="h-6 w-6 text-violet-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["unigram", "bigram", "trigram", "fourgram"] as const).map(
                (key, idx) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">
                        λ{idx + 1} · {key}
                      </span>
                      <span className="font-mono tabular-nums">
                        {lambdas[key].toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={lambdas[key]}
                      onChange={(e) =>
                        setLambdas({ ...lambdas, [key]: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                )
              )}

              <div className="flex items-center justify-between text-xs">
                <span>λ sum</span>
                <Badge variant={lambdaOk ? "success" : "danger"}>
                  {lambdaSum.toFixed(3)}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Smoothing k</span>
                  <span className="font-mono tabular-nums">{k.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.001}
                  max={1}
                  step={0.001}
                  value={k}
                  onChange={(e) => setK(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={trainLM2}
                  disabled={noData || lm2Status === "training"}
                  className="flex-1"
                >
                  <Play className="h-4 w-4" />
                  {lm2Status === "training" ? "Training…" : "Train LM2"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLambdas(normalizeLambdas(lambdas))}
                  title="Normalize λ to sum to 1"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLambdas({
                      unigram: 0.05,
                      bigram: 0.15,
                      trigram: 0.3,
                      fourgram: 0.5,
                    });
                    setK(0.1);
                  }}
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {lm2Status === "done" && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" /> Trained
                </Badge>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
      </div>
    </div>
  );
}
