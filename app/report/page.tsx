// app/report/page.tsx
// Auto-generated experiment report with export buttons.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  FileText,
  FileJson,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
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
  Badge,
  FadeIn,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildReport, reportToMarkdown } from "@/lib/report";

export default function ReportPage() {
  const {
    preprocessed,
    preprocessOptions,
    split,
    lm1Result,
    lm2Result,
    bestHyperparameters,
    generatedExamples,
    lambdas,
    k,
    trainedAt,
  } = useExperiment();

  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () =>
      buildReport({
        preprocessed,
        preprocessOptions,
        split,
        lm1Result,
        lm2Result,
        bestHyperparameters,
        generatedExamples,
      }),
    [
      preprocessed,
      preprocessOptions,
      split,
      lm1Result,
      lm2Result,
      bestHyperparameters,
      generatedExamples,
    ]
  );

  const markdown = useMemo(() => reportToMarkdown(report), [report]);
  const ready = !!preprocessed && !!split && (!!lm1Result || !!lm2Result);

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    download(
      `ngramlab-report-${Date.now()}.md`,
      markdown,
      "text/markdown;charset=utf-8"
    );
  }

  function exportJSON() {
    const data = {
      report,
      runtime: {
        lambdas,
        k,
        trainedAt,
      },
    };
    download(
      `ngramlab-experiment-${Date.now()}.json`,
      JSON.stringify(data, null, 2),
      "application/json"
    );
  }

  function copyReport() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function printPage() {
    window.print();
  }

  const corpusStats = [
    ["Characters", report.corpusSummary.characters],
    ["Tokens", report.corpusSummary.words],
    ["Sentences", report.corpusSummary.sentences],
    ["Vocabulary", report.corpusSummary.vocabSize],
  ] as const;

  const preprocessingRows = [
    ["Lowercase", String(preprocessOptions.lowercase)],
    ["Remove extra spaces", String(preprocessOptions.removeExtraSpaces)],
    ["Keep punctuation", String(preprocessOptions.keepPunctuation)],
    ["Sentence boundaries", String(preprocessOptions.addSentenceBoundaries)],
    [
      "Vocabulary limit",
      preprocessOptions.vocabSize === 0 ? "all" : String(preprocessOptions.vocabSize),
    ],
    [
      "Tokens used",
      `${preprocessOptions.startToken}, ${preprocessOptions.endToken}, ${preprocessOptions.unkToken}`,
    ],
  ] as const;

  const splitRows = [
    ["Train tokens", report.split.train],
    ["Validation tokens", report.split.validation],
    ["Test tokens", report.split.test],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 print:max-w-none print:p-0">
      <div className="print:hidden">
        <PageHeader
          step={{ current: 8, total: 8 }}
          title="Experiment Report"
          description="A clean, copy-pasteable summary of every choice you made and every number that came out. Suitable for academic submission."
        />
      </div>

      {!ready && (
        <Alert variant="warn" className="mb-6 print:hidden">
          <AlertTriangle className="h-4 w-4 inline mr-1 -mt-1" />
          The report is incomplete. Make sure you've preprocessed your corpus,
          split the dataset, and trained at least one model.
        </Alert>
      )}

      <FadeIn>
        <Card className="mb-6 print:hidden">
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>
              Download or copy the report in your preferred format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportMarkdown} disabled={!ready}>
                <FileText className="h-4 w-4" />
                Export Markdown
              </Button>
              <Button onClick={exportJSON} variant="secondary" disabled={!ready}>
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
              <Button onClick={copyReport} variant="outline" disabled={!ready}>
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy markdown
                  </>
                )}
              </Button>
              <Button onClick={printPage} variant="outline" disabled={!ready}>
                <Download className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              For PDF: use your browser's print dialog and choose "Save as PDF".
              The page is print-styled.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 overflow-hidden print:mb-0 print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <CardContent className="p-0">
            <article className="bg-white text-ink-900 dark:bg-ink-900 dark:text-ink-100 print:bg-white print:text-black">
              <header className="border-b border-ink-200 bg-ink-50 px-8 py-7 dark:border-ink-800 dark:bg-ink-950 print:border-black/20 print:bg-white print:px-0 print:pb-5 print:pt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700 print:text-black">
                      NGramLab
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight print:text-2xl">
                      Experiment Report
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 dark:text-ink-300 print:text-black/70">
                      Interactive 4-Gram Language Model Demo. Generated{" "}
                      {new Date(report.createdAt).toLocaleString()}.
                    </p>
                  </div>
                  <Badge
                    variant="accent"
                    className="self-start print:border print:border-black/30 print:bg-white print:text-black"
                  >
                    v1
                  </Badge>
                </div>
              </header>

              <div className="space-y-8 px-8 py-7 print:px-0 print:py-5">
                <section className="break-inside-avoid">
                  <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                    1. Corpus Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
                    {corpusStats.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-ink-200 bg-ink-50 p-3 dark:border-ink-800 dark:bg-ink-950 print:rounded-none print:border-black/20 print:bg-white"
                      >
                        <div className="text-xs font-medium uppercase tracking-wide text-ink-500 print:text-black/60">
                          {label}
                        </div>
                        <div className="mt-1 text-xl font-semibold print:text-lg">
                          {value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
                  <div className="break-inside-avoid">
                    <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                      2. Preprocessing
                    </h2>
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {preprocessingRows.map(([label, value]) => (
                          <tr
                            key={label}
                            className="border-b border-ink-200/80 dark:border-ink-800 print:border-black/15"
                          >
                            <th className="py-2 pr-4 text-left font-medium text-ink-500 print:text-black/60">
                              {label}
                            </th>
                            <td className="py-2 text-right font-medium">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="break-inside-avoid">
                    <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                      3. Dataset Split
                    </h2>
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {splitRows.map(([label, value]) => (
                          <tr
                            key={label}
                            className="border-b border-ink-200/80 dark:border-ink-800 print:border-black/15"
                          >
                            <th className="py-2 pr-4 text-left font-medium text-ink-500 print:text-black/60">
                              {label}
                            </th>
                            <td className="py-2 text-right font-semibold">
                              {value.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                    4. Model Design
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
                    <div className="break-inside-avoid rounded-lg border border-ink-200 p-4 dark:border-ink-800 print:rounded-none print:border-black/20">
                      <h3 className="font-semibold">LM1: Backoff Language Model</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-300 print:text-black/80">
                        LM1 is an unsmoothed 4-gram model that backs off to
                        lower-order models when the higher-order n-gram is
                        unseen. The fallback order is 4-gram to trigram to
                        bigram to unigram.
                      </p>
                    </div>
                    <div className="break-inside-avoid rounded-lg border border-ink-200 p-4 dark:border-ink-800 print:rounded-none print:border-black/20">
                      <h3 className="font-semibold">LM2: Linear Interpolation</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-300 print:text-black/80">
                        LM2 combines all four n-gram orders using add-k
                        smoothing. The interpolation is P(w | h) = lambda1 P1
                        + lambda2 P2 + lambda3 P3 + lambda4 P4.
                      </p>
                    </div>
                  </div>
                </section>

                {bestHyperparameters && (
                  <section className="break-inside-avoid">
                    <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                      5. Best Hyperparameters
                    </h2>
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        <tr className="border-b border-ink-200 dark:border-ink-800 print:border-black/15">
                          <th className="py-2 pr-4 text-left font-medium text-ink-500 print:text-black/60">
                            k
                          </th>
                          <td className="py-2 font-semibold">{bestHyperparameters.k}</td>
                        </tr>
                        <tr className="border-b border-ink-200 dark:border-ink-800 print:border-black/15">
                          <th className="py-2 pr-4 text-left font-medium text-ink-500 print:text-black/60">
                            Lambdas
                          </th>
                          <td className="py-2">
                            unigram {bestHyperparameters.lambdas.unigram.toFixed(2)},{" "}
                            bigram {bestHyperparameters.lambdas.bigram.toFixed(2)},{" "}
                            trigram {bestHyperparameters.lambdas.trigram.toFixed(2)},{" "}
                            fourgram {bestHyperparameters.lambdas.fourgram.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-ink-200 dark:border-ink-800 print:border-black/15">
                          <th className="py-2 pr-4 text-left font-medium text-ink-500 print:text-black/60">
                            Validation perplexity
                          </th>
                          <td className="py-2 font-semibold">
                            {bestHyperparameters.perplexity.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                )}

                <section className="break-inside-avoid">
                  <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                    6. Test-Set Perplexity
                  </h2>
                  {report.modelResults.length === 0 ? (
                    <p className="text-sm italic text-ink-500">
                      No models evaluated yet.
                    </p>
                  ) : (
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-y border-ink-300 bg-ink-50 text-left dark:border-ink-800 dark:bg-ink-950 print:border-black/30 print:bg-white">
                          <th className="px-3 py-2 font-semibold">Model</th>
                          <th className="px-3 py-2 font-semibold">Method</th>
                          <th className="px-3 py-2 font-semibold">Smoothing</th>
                          <th className="px-3 py-2 text-right font-semibold">
                            Perplexity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.modelResults.map((r) => (
                          <tr
                            key={r.name}
                            className="border-b border-ink-200 dark:border-ink-800 print:border-black/15"
                          >
                            <td className="px-3 py-2 font-medium">{r.name}</td>
                            <td className="px-3 py-2">{r.method}</td>
                            <td className="px-3 py-2">{r.smoothing}</td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {isFinite(r.perplexity)
                                ? r.perplexity.toFixed(2)
                                : "infinity"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                <section>
                  <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                    7. Generated Examples
                  </h2>
                  {report.generatedExamples.length === 0 ? (
                    <p className="text-sm italic text-ink-500">
                      No generations recorded yet.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {report.generatedExamples.slice(0, 5).map((ex, i) => (
                        <li
                          key={i}
                          className="break-inside-avoid rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm leading-6 dark:border-ink-800 dark:bg-ink-950 print:rounded-none print:border-black/15 print:bg-white"
                        >
                          <span className="mr-2 font-semibold text-ink-500 print:text-black/60">
                            {i + 1}.
                          </span>
                          <span className="italic">{ex}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                <section className="break-inside-avoid">
                  <h2 className="mb-3 border-b border-ink-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-ink-700 dark:border-ink-800 dark:text-ink-300 print:border-black/20 print:text-black">
                    8. Conclusion
                  </h2>
                  <p className="rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm leading-6 text-ink-800 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-200 print:rounded-none print:border-black/20 print:bg-white print:text-black">
                    On the held-out test set, the interpolation model (LM2)
                    with add-k smoothing produces a finite, well-defined
                    perplexity even when 4-grams in the test split are unseen
                    in training, because lower-order probabilities are always
                    mixed in and zero counts are smoothed. The unsmoothed
                    backoff model (LM1) is simpler but fragile; a single
                    unseen 4-gram that also has zero counts at all lower orders
                    can force probability toward zero and perplexity toward
                    infinity. For a small, in-domain corpus, LM2 is the more
                    reliable choice.
                  </p>
                </section>
              </div>
            </article>
          </CardContent>
        </Card>

        <Card className="mb-8 print:hidden">
          <CardHeader>
            <CardTitle>Raw markdown</CardTitle>
            <CardDescription>
              The exact content the "Export Markdown" button writes to disk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-4 text-xs text-ink-700 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-300">
              {markdown}
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-end print:hidden">
          <Link href="/4gram/explain">
            <Button variant="secondary">
              Read methodology explainer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
