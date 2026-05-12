// app/tuning/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, ZapOff } from "lucide-react";
import {
  Button,
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
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildAllCounts } from "@/lib/nlp/ngrams";
import { perplexityInterpolation } from "@/lib/nlp/perplexity";
import { formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { LambdaWeights } from "@/types/nlp";

const K_VALUES = [0.01, 0.05, 0.1, 0.5, 1.0];
const LAMBDA_PRESETS: { name: string; lambdas: LambdaWeights }[] = [
  { name: "Heavy 4-gram", lambdas: { unigram: 0.05, bigram: 0.15, trigram: 0.3, fourgram: 0.5 } },
  { name: "Balanced↑", lambdas: { unigram: 0.1, bigram: 0.2, trigram: 0.3, fourgram: 0.4 } },
  { name: "Uniform", lambdas: { unigram: 0.25, bigram: 0.25, trigram: 0.25, fourgram: 0.25 } },
  { name: "Heavy unigram", lambdas: { unigram: 0.4, bigram: 0.3, trigram: 0.2, fourgram: 0.1 } },
];

interface Row {
  preset: string;
  lambdas: LambdaWeights;
  k: number;
  perplexity: number;
}

export default function TuningPage() {
  const {
    preprocessed,
    split,
    counts,
    setCounts,
    setLambdas,
    setK,
    setBestHyperparameters,
    bestHyperparameters,
  } = useExperiment();

  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!counts && split && preprocessed) {
      setCounts(buildAllCounts(split.train, preprocessed.vocabulary));
    }
  }, [counts, split, preprocessed, setCounts]);

  function runSweep() {
    if (!split || !preprocessed) return;
    setRunning(true);
    setTimeout(() => {
      let c = counts;
      if (!c) {
        c = buildAllCounts(split.train, preprocessed.vocabulary);
        setCounts(c);
      }
      const results: Row[] = [];
      for (const preset of LAMBDA_PRESETS) {
        for (const kv of K_VALUES) {
          const { perplexity } = perplexityInterpolation(
            split.validation,
            c,
            preset.lambdas,
            kv
          );
          results.push({
            preset: preset.name,
            lambdas: preset.lambdas,
            k: kv,
            perplexity,
          });
        }
      }
      results.sort((a, b) => a.perplexity - b.perplexity);
      setRows(results);
      const best = results[0];
      if (best && isFinite(best.perplexity)) {
        setBestHyperparameters({
          lambdas: best.lambdas,
          k: best.k,
          perplexity: best.perplexity,
        });
      }
      setRunning(false);
    }, 80);
  }

  function applyBest(row: Row) {
    setLambdas(row.lambdas);
    setK(row.k);
    setBestHyperparameters({
      lambdas: row.lambdas,
      k: row.k,
      perplexity: row.perplexity,
    });
  }

  const noData = !split || !preprocessed;

  // Build chart: perplexity by k value, averaged across presets
  const chartByK = K_VALUES.map((kv) => {
    const matching = rows.filter((r) => r.k === kv);
    const avg = matching.length
      ? matching.reduce((s, r) => s + r.perplexity, 0) / matching.length
      : 0;
    return { k: kv.toString(), perplexity: Number(avg.toFixed(2)) };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Hyperparameter tuning"
        description="Sweep λ presets × k values on the validation set and pick the configuration with the lowest perplexity."
        step={{ current: 5, total: 8 }}
      >
        <Button onClick={runSweep} disabled={noData || running}>
          <Sparkles className="h-4 w-4" />
          {running ? "Running…" : "Run sweep"}
        </Button>
        <Link href="/4gram/evaluation">
          <Button variant="outline" disabled={!bestHyperparameters}>
            Next: Evaluate <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {noData && (
        <Alert variant="warn" className="mb-6">
          You need a training and validation split first.{" "}
          <Link href="/4gram/split" className="underline">Split the corpus.</Link>
        </Alert>
      )}

      {bestHyperparameters && (
        <FadeIn>
          <Card className="mb-6 border-accent-400/40">
            <CardContent className="p-6 bg-glow">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/20 text-accent-700 dark:text-accent-300">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Best configuration
                    </div>
                    <div className="font-display text-xl font-semibold">
                      Perplexity {bestHyperparameters.perplexity.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <Mini label="λ₁" value={bestHyperparameters.lambdas.unigram.toFixed(2)} />
                  <Mini label="λ₂" value={bestHyperparameters.lambdas.bigram.toFixed(2)} />
                  <Mini label="λ₃" value={bestHyperparameters.lambdas.trigram.toFixed(2)} />
                  <Mini label="λ₄" value={bestHyperparameters.lambdas.fourgram.toFixed(2)} />
                  <Mini label="k" value={bestHyperparameters.k.toString()} />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Experiment table</CardTitle>
              <CardDescription>
                {LAMBDA_PRESETS.length} λ presets × {K_VALUES.length} k values ={" "}
                {LAMBDA_PRESETS.length * K_VALUES.length} configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <div className="py-10 text-center text-sm text-ink-500 dark:text-ink-400">
                  <ZapOff className="h-8 w-8 mx-auto opacity-40 mb-2" />
                  Click <Badge className="mx-1">Run sweep</Badge> to populate.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[480px] scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-ink-900">
                      <tr className="text-left text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800">
                        <th className="py-2 pr-3">Preset</th>
                        <th className="py-2 pr-3">λ₁</th>
                        <th className="py-2 pr-3">λ₂</th>
                        <th className="py-2 pr-3">λ₃</th>
                        <th className="py-2 pr-3">λ₄</th>
                        <th className="py-2 pr-3">k</th>
                        <th className="py-2 pr-3 text-right">Perplexity</th>
                        <th className="py-2 pr-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr
                          key={i}
                          className={`border-b border-ink-100/60 dark:border-ink-800/60 ${
                            i === 0
                              ? "bg-accent-400/5 ring-1 ring-inset ring-accent-400/20"
                              : ""
                          }`}
                        >
                          <td className="py-1.5 pr-3 font-medium">
                            {r.preset}
                            {i === 0 && (
                              <Badge variant="success" className="ml-2">
                                <Trophy className="h-3 w-3" /> best
                              </Badge>
                            )}
                          </td>
                          <td className="py-1.5 pr-3 font-mono text-xs">{r.lambdas.unigram.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 font-mono text-xs">{r.lambdas.bigram.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 font-mono text-xs">{r.lambdas.trigram.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 font-mono text-xs">{r.lambdas.fourgram.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 font-mono text-xs">{r.k}</td>
                          <td className="py-1.5 pr-3 text-right font-mono">
                            {isFinite(r.perplexity) ? r.perplexity.toFixed(2) : "∞"}
                          </td>
                          <td className="py-1.5 pr-3 text-right">
                            <button
                              onClick={() => applyBest(r)}
                              className="text-xs text-accent-600 dark:text-accent-300 hover:underline"
                            >
                              apply
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Perplexity vs k</CardTitle>
              <CardDescription>
                Average across λ presets. Lower is better.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {rows.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-ink-500 dark:text-ink-400">
                  Run sweep to see chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartByK}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="k" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,.08)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="perplexity"
                      fill="#22d3ee"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {split && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Stat
                label="Validation tokens"
                value={formatNumber(split.validation.length)}
              />
              <Stat
                label="Configurations"
                value={formatNumber(rows.length)}
              />
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-200 dark:border-ink-800 px-2 py-1 text-center">
      <div className="text-[10px] text-ink-500 dark:text-ink-400 uppercase tracking-wider">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}
