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

  const ready =
    !!preprocessed &&
    !!split &&
    (!!lm1Result || !!lm2Result);

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

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <PageHeader
        step={{ current: 8, total: 8 }}
        title="Experiment Report"
        description="A clean, copy-pasteable summary of every choice you made and every number that came out. Suitable for academic submission."
      />

      {!ready && (
        <Alert variant="warn" className="mb-6">
          <AlertTriangle className="h-4 w-4 inline mr-1 -mt-1" />
          The report is incomplete. Make sure you've preprocessed your corpus,
          split the dataset, and trained at least one model.
        </Alert>
      )}

      <FadeIn>
        <Card className="mb-6">
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
              <Button
                onClick={exportJSON}
                variant="secondary"
                disabled={!ready}
              >
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
              <Button
                onClick={copyReport}
                variant="outline"
                disabled={!ready}
              >
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
              <Button
                onClick={printPage}
                variant="outline"
                disabled={!ready}
              >
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

        {/* RENDERED REPORT */}
        <Card className="mb-8 print:shadow-none print:border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NGramLab — Experiment Report</CardTitle>
              <Badge variant="accent">v1</Badge>
            </div>
            <CardDescription>
              Generated {new Date(report.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none print:prose-base">
              <h3>1. Corpus Summary</h3>
              <ul>
                <li>
                  Characters:{" "}
                  <strong>
                    {report.corpusSummary.characters.toLocaleString()}
                  </strong>
                </li>
                <li>
                  Tokens:{" "}
                  <strong>
                    {report.corpusSummary.words.toLocaleString()}
                  </strong>
                </li>
                <li>
                  Sentences:{" "}
                  <strong>
                    {report.corpusSummary.sentences.toLocaleString()}
                  </strong>
                </li>
                <li>
                  Vocabulary size:{" "}
                  <strong>
                    {report.corpusSummary.vocabSize.toLocaleString()}
                  </strong>
                </li>
              </ul>

              <h3>2. Preprocessing</h3>
              <ul>
                <li>Lowercase: {String(preprocessOptions.lowercase)}</li>
                <li>
                  Remove extra spaces:{" "}
                  {String(preprocessOptions.removeExtraSpaces)}
                </li>
                <li>
                  Keep punctuation:{" "}
                  {String(preprocessOptions.keepPunctuation)}
                </li>
                <li>
                  Sentence boundary tokens:{" "}
                  {String(preprocessOptions.addSentenceBoundaries)}
                </li>
                <li>
                  Vocabulary limit:{" "}
                  {preprocessOptions.vocabSize === 0
                    ? "all"
                    : preprocessOptions.vocabSize}
                </li>
                <li>
                  Tokens used:{" "}
                  <code>{preprocessOptions.startToken}</code>,{" "}
                  <code>{preprocessOptions.endToken}</code>,{" "}
                  <code>{preprocessOptions.unkToken}</code>
                </li>
              </ul>

              <h3>3. Dataset Split</h3>
              <ul>
                <li>
                  Train tokens:{" "}
                  <strong>{report.split.train.toLocaleString()}</strong>
                </li>
                <li>
                  Validation tokens:{" "}
                  <strong>{report.split.validation.toLocaleString()}</strong>
                </li>
                <li>
                  Test tokens:{" "}
                  <strong>{report.split.test.toLocaleString()}</strong>
                </li>
              </ul>

              <h3>4. LM1 — Backoff Language Model</h3>
              <p>
                LM1 is an unsmoothed 4-gram model that backs off to lower-order
                models when the higher-order n-gram is unseen. The fallback
                order is{" "}
                <em>4-gram → trigram → bigram → unigram</em>. When all four are
                unseen for a context-word pair, the probability collapses to a
                tiny epsilon and perplexity may diverge.
              </p>

              <h3>5. LM2 — Linear Interpolation with Add-k Smoothing</h3>
              <p>
                LM2 combines all four orders linearly:{" "}
                <code>
                  P(wᵢ | h) = λ₁P₁(wᵢ) + λ₂P₂(wᵢ|h₂) + λ₃P₃(wᵢ|h₃) +
                  λ₄P₄(wᵢ|h₄)
                </code>{" "}
                where each P uses add-k smoothing{" "}
                <code>(c + k) / (N + k·V)</code>.
              </p>
              {bestHyperparameters && (
                <>
                  <p>
                    <strong>Best hyperparameters</strong> (from validation
                    sweep):
                  </p>
                  <ul>
                    <li>
                      k = <code>{bestHyperparameters.k}</code>
                    </li>
                    <li>
                      λ₁ = {bestHyperparameters.lambdas.unigram.toFixed(2)} · λ₂
                      = {bestHyperparameters.lambdas.bigram.toFixed(2)} · λ₃ ={" "}
                      {bestHyperparameters.lambdas.trigram.toFixed(2)} · λ₄ ={" "}
                      {bestHyperparameters.lambdas.fourgram.toFixed(2)}
                    </li>
                    <li>
                      Validation perplexity:{" "}
                      <strong>
                        {bestHyperparameters.perplexity.toFixed(2)}
                      </strong>
                    </li>
                  </ul>
                </>
              )}

              <h3>6. Test-Set Perplexity</h3>
              {report.modelResults.length === 0 ? (
                <p>
                  <em>No models evaluated yet.</em>
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Method</th>
                      <th>Smoothing</th>
                      <th>Perplexity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.modelResults.map((r) => (
                      <tr key={r.name}>
                        <td>{r.name}</td>
                        <td>{r.method}</td>
                        <td>{r.smoothing}</td>
                        <td>
                          <strong>
                            {isFinite(r.perplexity)
                              ? r.perplexity.toFixed(2)
                              : "∞"}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h3>7. Generated Examples</h3>
              {report.generatedExamples.length === 0 ? (
                <p>
                  <em>No generations recorded yet.</em>
                </p>
              ) : (
                <ol>
                  {report.generatedExamples.slice(0, 5).map((ex, i) => (
                    <li key={i}>
                      <em>{ex}</em>
                    </li>
                  ))}
                </ol>
              )}

              <h3>8. Conclusion</h3>
              <p>
                On the held-out test set, the interpolation model (LM2) with
                add-k smoothing produces a finite, well-defined perplexity even
                when 4-grams in the test split are unseen in training, because
                lower-order probabilities are always mixed in and zero counts
                are smoothed. The unsmoothed backoff model (LM1) is simpler but
                fragile: a single unseen 4-gram that also has zero counts at
                all lower orders forces the probability toward zero and
                perplexity toward infinity. For a small, in-domain corpus like
                the ones bundled here, LM2 is the more reliable choice.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Raw markdown</CardTitle>
            <CardDescription>
              The exact content the "Export Markdown" button writes to disk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg border border-ink-800 bg-ink-950 p-4 text-xs text-ink-300 overflow-x-auto max-h-80">
              {markdown}
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Link href="/explain">
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
