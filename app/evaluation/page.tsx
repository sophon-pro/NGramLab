// app/evaluation/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Play, Trophy } from "lucide-react";
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
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildAllCounts } from "@/lib/nlp/ngrams";
import { lambdasValid, normalizeLambdas } from "@/lib/nlp/interpolation";
import {
  perplexityBackoff,
  perplexityInterpolation,
} from "@/lib/nlp/perplexity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function EvaluationPage() {
  const {
    preprocessed,
    split,
    counts,
    setCounts,
    lambdas,
    k,
    lm1Result,
    lm2Result,
    setLM1Result,
    setLM2Result,
  } = useExperiment();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!counts && split && preprocessed) {
      setCounts(buildAllCounts(split.train, preprocessed.vocabulary));
    }
  }, [counts, split, preprocessed, setCounts]);

  function runEval() {
    if (!split || !preprocessed) return;
    setRunning(true);
    setTimeout(() => {
      let c = counts;
      if (!c) {
        c = buildAllCounts(split.train, preprocessed.vocabulary);
        setCounts(c);
      }
      // LM1 test perplexity
      const r1 = perplexityBackoff(split.test, c);
      setLM1Result({
        name: "LM1",
        method: "Backoff",
        smoothing: "None",
        perplexity: r1.perplexity,
        settings: {},
      });
      // LM2 test perplexity
      const safeLambdas = lambdasValid(lambdas) ? lambdas : normalizeLambdas(lambdas);
      const r2 = perplexityInterpolation(split.test, c, safeLambdas, k);
      setLM2Result({
        name: "LM2",
        method: "Interpolation",
        smoothing: `add-k (k=${k})`,
        perplexity: r2.perplexity,
        settings: { lambdas: safeLambdas, k },
      });
      setRunning(false);
    }, 80);
  }

  const noData = !split || !preprocessed;
  const both = lm1Result && lm2Result;

  // Cap infinity to a large display number so the chart stays readable.
  const chartData =
    lm1Result && lm2Result
      ? [
          {
            name: "LM1 (Backoff)",
            value: isFinite(lm1Result.perplexity)
              ? Number(lm1Result.perplexity.toFixed(2))
              : 99999,
            isInf: !isFinite(lm1Result.perplexity),
            fill: "#22d3ee",
          },
          {
            name: "LM2 (Interp.)",
            value: isFinite(lm2Result.perplexity)
              ? Number(lm2Result.perplexity.toFixed(2))
              : 99999,
            isInf: !isFinite(lm2Result.perplexity),
            fill: "#a78bfa",
          },
        ]
      : [];

  const winner = both
    ? lm1Result.perplexity < lm2Result.perplexity
      ? "LM1"
      : "LM2"
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Evaluation"
        description="Compute perplexity on the held-out test set and compare LM1 vs LM2."
        step={{ current: 6, total: 8 }}
      >
        <Button onClick={runEval} disabled={noData || running}>
          <Play className="h-4 w-4" />
          {running ? "Computing…" : "Evaluate on test"}
        </Button>
        <Link href="/generator">
          <Button variant="outline" disabled={!both}>
            Generate text <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {noData && (
        <Alert variant="warn" className="mb-6">
          You need a split dataset before evaluation.{" "}
          <Link href="/split" className="underline">Go to split.</Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test perplexity</CardTitle>
              <CardDescription>
                Lower perplexity = better next-token predictions on the held-out
                test split.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800">
                      <th className="py-2 pr-4">Model</th>
                      <th className="py-2 pr-4">Method</th>
                      <th className="py-2 pr-4">Smoothing</th>
                      <th className="py-2 pr-4 text-right">Perplexity</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[lm1Result, lm2Result].map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-ink-100/60 dark:border-ink-800/60"
                      >
                        <td className="py-2 pr-4 font-semibold">
                          {r?.name ?? (i === 0 ? "LM1" : "LM2")}
                        </td>
                        <td className="py-2 pr-4">
                          {r?.method ?? (i === 0 ? "Backoff" : "Interpolation")}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {r?.smoothing ?? (i === 0 ? "None" : `add-k (k=${k})`)}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">
                          {r
                            ? isFinite(r.perplexity)
                              ? r.perplexity.toFixed(2)
                              : "∞"
                            : "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {!r ? (
                            <Badge variant="default">not run</Badge>
                          ) : !isFinite(r.perplexity) ? (
                            <Badge variant="danger">∞ (zero prob)</Badge>
                          ) : winner === r.name ? (
                            <Badge variant="success">
                              <Trophy className="h-3 w-3" /> best
                            </Badge>
                          ) : (
                            <Badge variant="default">ok</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {both && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Interpretation</CardTitle>
                <CardDescription>What the numbers tell us.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!isFinite(lm1Result.perplexity) && (
                  <p>
                    <strong>LM1 hit infinity.</strong> The test set contains
                    n-grams (or even single unigrams) that never appeared in
                    training, and without smoothing those words receive zero
                    probability — which makes the log-likelihood diverge.
                    This is the textbook motivation for smoothing.
                  </p>
                )}
                {isFinite(lm1Result.perplexity) && (
                  <p>
                    LM1 reached <strong>{lm1Result.perplexity.toFixed(2)}</strong>{" "}
                    perplexity. Backoff alone can keep numbers finite when the
                    test set vocabulary stays inside training vocabulary, but it
                    has no buffer for rare events.
                  </p>
                )}
                <p>
                  LM2 reached <strong>{lm2Result.perplexity.toFixed(2)}</strong>{" "}
                  perplexity. Add-k smoothing ensures every n-gram receives a
                  positive probability, and interpolation blends the
                  generalization of lower-order n-grams with the specificity of
                  higher-order ones.
                </p>
                <p className="text-ink-500 dark:text-ink-400">
                  In practice LM2 usually wins, especially on short corpora.
                  The exact gap depends on λ, k, and how out-of-distribution the
                  test split is.
                </p>
              </CardContent>
            </Card>
          )}
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
              <CardDescription>Lower is better.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-ink-500 dark:text-ink-400">
                  <BarChart3 className="h-8 w-8 opacity-40 mr-2" />
                  Run evaluation
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,.08)",
                        fontSize: 12,
                      }}
                      formatter={(v: any, _name: any, props: any) =>
                        props.payload.isInf ? "∞" : v
                      }
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Alert variant="info" className="mt-4">
            Perplexity is computed in log space:{" "}
            <code className="font-mono text-xs">
              exp(-1/N · Σ log P(wᵢ | h))
            </code>{" "}
            over all 4-gram windows in the test set.
          </Alert>
        </FadeIn>
      </div>
    </div>
  );
}
