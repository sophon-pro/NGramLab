// app/dashboard/page.tsx
// Summary dashboard for the whole experiment.
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  Alert,
  Badge,
  FadeIn,
  Stat,
  Button,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildAllCounts, topNGrams } from "@/lib/nlp/ngrams";
import { formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const SPLIT_COLORS = ["#22d3ee", "#a78bfa", "#34d399"];

export default function DashboardPage() {
  const {
    preprocessed,
    preprocessOptions,
    split,
    counts,
    setCounts,
    lm1Result,
    lm2Result,
    bestHyperparameters,
    generatedExamples,
    trainedAt,
  } = useExperiment();

  useEffect(() => {
    if (!counts && split) {
      setCounts(buildAllCounts(split.train, preprocessed?.vocabulary ?? []));
    }
  }, [counts, split, preprocessed, setCounts]);

  const topUnigrams = useMemo(() => {
    if (!counts) return [];
    return topNGrams(counts.unigrams, 10).map((r) => ({
      word: r.ngram,
      count: r.count,
    }));
  }, [counts]);

  const splitData = useMemo(() => {
    if (!split) return [];
    return [
      { name: "Train", value: split.train.length },
      { name: "Validation", value: split.validation.length },
      { name: "Test", value: split.test.length },
    ];
  }, [split]);

  const perplexityData = useMemo(() => {
    const arr: { name: string; value: number; isInf: boolean }[] = [];
    if (lm1Result) {
      arr.push({
        name: "LM1 Backoff",
        value: isFinite(lm1Result.perplexity)
          ? lm1Result.perplexity
          : 99999,
        isInf: !isFinite(lm1Result.perplexity),
      });
    }
    if (lm2Result) {
      arr.push({
        name: "LM2 Interpolation",
        value: lm2Result.perplexity,
        isInf: false,
      });
    }
    return arr;
  }, [lm1Result, lm2Result]);

  const bestModel = useMemo(() => {
    if (!lm1Result && !lm2Result) return null;
    if (!lm1Result) return "LM2";
    if (!lm2Result) return "LM1";
    const p1 = isFinite(lm1Result.perplexity)
      ? lm1Result.perplexity
      : Infinity;
    return p1 <= lm2Result.perplexity ? "LM1" : "LM2";
  }, [lm1Result, lm2Result]);

  const hasData = !!preprocessed && !!split;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <PageHeader
        title="Experiment Dashboard"
        description="A bird's-eye view of every stage. Numbers update as you progress through the pipeline."
      />

      {!hasData && (
        <Alert variant="info" className="mb-6">
          <AlertTriangle className="h-4 w-4 inline mr-1 -mt-1" />
          The dashboard is empty until you load a corpus and run preprocessing.{" "}
          <Link href="/corpus" className="underline">
            Start here →
          </Link>
        </Alert>
      )}

      <FadeIn>
        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat
            label="Corpus characters"
            value={
              preprocessed ? formatNumber(preprocessed.rawText.length) : "—"
            }
          />
          <Stat
            label="Total tokens"
            value={
              preprocessed ? formatNumber(preprocessed.tokens.length) : "—"
            }
          />
          <Stat
            label="Vocabulary"
            value={
              preprocessed ? formatNumber(preprocessed.vocabulary.length) : "—"
            }
            sublabel={
              preprocessed
                ? `${formatNumber(preprocessed.unkReplacements)} <UNK>`
                : undefined
            }
          />
          <Stat
            label="Sentences"
            value={
              preprocessed
                ? formatNumber(
                    preprocessed.tokens.filter(
                      (t) => t === preprocessOptions.endToken
                    ).length
                  )
                : "—"
            }
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Stat
            label="Train tokens"
            value={split ? formatNumber(split.train.length) : "—"}
            accent
          />
          <Stat
            label="Validation tokens"
            value={split ? formatNumber(split.validation.length) : "—"}
          />
          <Stat
            label="Test tokens"
            value={split ? formatNumber(split.test.length) : "—"}
          />
        </div>

        {/* MODEL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">LM1 Backoff</CardTitle>
                {bestModel === "LM1" && (
                  <Badge variant="success">
                    <Trophy className="h-3 w-3" />
                    Best
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-accent-300">
                {lm1Result
                  ? isFinite(lm1Result.perplexity)
                    ? lm1Result.perplexity.toFixed(2)
                    : "∞"
                  : "—"}
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Test perplexity (lower is better)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">LM2 Interpolation</CardTitle>
                {bestModel === "LM2" && (
                  <Badge variant="success">
                    <Trophy className="h-3 w-3" />
                    Best
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-violetx-300">
                {lm2Result ? lm2Result.perplexity.toFixed(2) : "—"}
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Test perplexity (lower is better)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best LM2 hyperparams</CardTitle>
            </CardHeader>
            <CardContent>
              {bestHyperparameters ? (
                <div className="text-xs font-mono text-ink-300 space-y-0.5">
                  <div>
                    k ={" "}
                    <span className="text-accent-300">
                      {bestHyperparameters.k}
                    </span>
                  </div>
                  <div>
                    λ₁ = {bestHyperparameters.lambdas.unigram.toFixed(2)}
                  </div>
                  <div>
                    λ₂ = {bestHyperparameters.lambdas.bigram.toFixed(2)}
                  </div>
                  <div>
                    λ₃ = {bestHyperparameters.lambdas.trigram.toFixed(2)}
                  </div>
                  <div>
                    λ₄ = {bestHyperparameters.lambdas.fourgram.toFixed(2)}
                  </div>
                  <div className="mt-1 text-ink-500">
                    val PP = {bestHyperparameters.perplexity.toFixed(2)}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-500">
                  Not yet tuned.{" "}
                  <Link href="/tuning" className="underline">
                    Run sweep →
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top tokens</CardTitle>
              <CardDescription>
                Most frequent unigrams in the training split.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topUnigrams.length === 0 ? (
                <p className="text-sm text-ink-500">No data yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topUnigrams}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="word"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1220",
                          border: "1px solid #1f2937",
                          borderRadius: 8,
                          color: "#e2e8f0",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#22d3ee"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dataset split</CardTitle>
              <CardDescription>Tokens per split.</CardDescription>
            </CardHeader>
            <CardContent>
              {splitData.length === 0 ? (
                <p className="text-sm text-ink-500">Not split yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={splitData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        stroke="#0b1220"
                        strokeWidth={2}
                      >
                        {splitData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={SPLIT_COLORS[i % SPLIT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0b1220",
                          border: "1px solid #1f2937",
                          borderRadius: 8,
                          color: "#e2e8f0",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Perplexity comparison</CardTitle>
              <CardDescription>
                Test-set perplexity. Lower is better. LM1 with no smoothing can
                go to infinity when an unseen 4-gram appears.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {perplexityData.length === 0 ? (
                <p className="text-sm text-ink-500">No evaluation yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={perplexityData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1220",
                          border: "1px solid #1f2937",
                          borderRadius: 8,
                          color: "#e2e8f0",
                        }}
                        formatter={(v: number, _n, p: any) =>
                          p.payload.isInf ? "∞" : v.toFixed(2)
                        }
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {perplexityData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              d.isInf
                                ? "#f87171"
                                : i === 0
                                  ? "#22d3ee"
                                  : "#a78bfa"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RECENT TEXT */}
        {generatedExamples.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Latest generated text</CardTitle>
              <CardDescription>
                Most recent output produced from the Generator page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-ink-800 bg-ink-950 p-4 font-serif text-ink-200 leading-relaxed">
                {generatedExamples[0]}
              </div>
            </CardContent>
          </Card>
        )}

        {trainedAt && (
          <p className="text-xs text-ink-500 mb-6">
            Models last trained:{" "}
            <span className="text-ink-300">
              {new Date(trainedAt).toLocaleString()}
            </span>
          </p>
        )}

        <div className="flex justify-end">
          <Link href="/report">
            <Button>
              Export report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
