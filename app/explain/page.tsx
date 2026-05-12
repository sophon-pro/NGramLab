// app/explain/page.tsx
// Educational page explaining each concept in plain language.
"use client";

import Link from "next/link";
import {
  BookOpen,
  Type,
  Layers,
  ArrowDownToLine,
  Blend,
  Shield,
  Gauge,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  FadeIn,
  Badge,
  Button,
} from "@/components/ui/primitives";

export default function ExplainPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="How NGramLab Works"
        description="Each concept used in the pipeline, explained without jargon. Useful before your presentation."
      />

      <FadeIn>
        <div className="grid grid-cols-1 gap-5">
          <Concept
            icon={<BookOpen className="h-5 w-5" />}
            label="01"
            title="What is a corpus?"
            tag="Foundation"
          >
            <p>
              A <strong>corpus</strong> is a body of text: newspaper articles,
              a novel, Wikipedia pages, tweets, or any other written source. The
              model learns its statistics: which words appear, and which words
              tend to follow which other words.
            </p>
            <p>
              In NGramLab you can paste your own text, upload a <code>.txt</code>{" "}
              file, extract text from a website, or pick a bundled sample.
            </p>
          </Concept>

          <Concept
            icon={<Type className="h-5 w-5" />}
            label="02"
            title="What is tokenization?"
            tag="Preprocessing"
          >
            <p>
              Computers do not understand sentences directly. Tokenization turns
              raw text into a list of discrete units called <strong>tokens</strong>.
            </p>
            <Example before='"I love NLP."' after='["i", "love", "nlp"]' />
            <p>
              NGramLab can insert sentence-boundary tokens <code>&lt;s&gt;</code>{" "}
              and <code>&lt;/s&gt;</code>. Rare words outside the vocabulary cap
              are replaced with <code>&lt;UNK&gt;</code>.
            </p>
          </Concept>

          <Concept
            icon={<Layers className="h-5 w-5" />}
            label="03"
            title="What is an n-gram?"
            tag="Core idea"
          >
            <p>
              An <strong>n-gram</strong> is a contiguous sequence of <em>n</em>{" "}
              tokens. We use n-grams to estimate how likely the next word is
              given the words before it.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Tile name="unigram" example="['the']" />
              <Tile name="bigram" example="['the','quick']" />
              <Tile name="trigram" example="['the','quick','brown']" />
              <Tile name="4-gram" example="['the','quick','brown','fox']" />
            </div>
            <p>
              A 4-gram model conditions on the previous 3 words to predict the
              fourth. Its probability is estimated by counting:
            </p>
            <Formula>
              P(w4 | w1 w2 w3) ~= Count(w1 w2 w3 w4) / Count(w1 w2 w3)
            </Formula>
          </Concept>

          <Concept
            icon={<ArrowDownToLine className="h-5 w-5" />}
            label="04"
            title="What is backoff?"
            tag="LM1"
          >
            <p>
              When the 4-gram you need was never seen in training, the count is
              zero. <strong>Backoff</strong> falls back to shorter contexts:
              trigram, then bigram, then unigram.
            </p>
            <Formula>4-gram -&gt; trigram -&gt; bigram -&gt; unigram -&gt; epsilon</Formula>
            <p>
              LM1 uses backoff with no smoothing. This is simple but brittle:
              a single unseen sequence can push probability toward zero and
              perplexity toward infinity.
            </p>
          </Concept>

          <Concept
            icon={<Blend className="h-5 w-5" />}
            label="05"
            title="What is interpolation?"
            tag="LM2"
          >
            <p>
              Instead of choosing one n-gram order, interpolation{" "}
              <strong>mixes all orders</strong> with weights that sum to 1.
            </p>
            <Formula>
              P(w | h) = lambda1 P1(w) + lambda2 P2(w|h) + lambda3 P3(w|h) +
              lambda4 P4(w|h)
            </Formula>
            <p>
              Heavier 4-gram weight trusts longer context more. Heavier unigram
              weight falls back to overall word frequency. The Tuning page
              searches for a good balance.
            </p>
          </Concept>

          <Concept
            icon={<Shield className="h-5 w-5" />}
            label="06"
            title="What is smoothing?"
            tag="Add-k"
          >
            <p>
              Smoothing keeps probabilities away from exactly zero by adding a
              small constant <code>k</code> to every count.
            </p>
            <Formula>P(w | h) = (Count(h, w) + k) / (Count(h) + k * V)</Formula>
            <p>
              <code>V</code> is the vocabulary size. NGramLab applies add-k
              smoothing inside each n-gram term of the interpolation, so unseen
              4-grams can still contribute a non-zero probability.
            </p>
          </Concept>

          <Concept
            icon={<Gauge className="h-5 w-5" />}
            label="07"
            title="What is perplexity?"
            tag="Evaluation"
          >
            <p>
              <strong>Perplexity</strong> measures how surprised the model is
              by held-out text. It is based on the negative average
              log-probability assigned to the test sequence.
            </p>
            <Formula>PP(W) = exp( - (1 / N) * sum log P(w_i | context) )</Formula>
            <p>
              Lower is better. Perplexity can blow up if any probability hits
              zero, which is why LM1 can become infinite while LM2 stays finite.
            </p>
          </Concept>

          <Concept
            icon={<Layers className="h-5 w-5" />}
            label="08"
            title="Temperature & sampling"
            tag="Generation"
          >
            <p>When generating, the model can choose words in several ways:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Greedy</strong> - always pick the top word. Predictable
                but repetitive.
              </li>
              <li>
                <strong>Weighted random</strong> - sample proportional to
                probability. More natural variation.
              </li>
              <li>
                <strong>Top-K</strong> - keep only the K most likely words, then
                sample from that smaller set.
              </li>
            </ul>
            <p>
              <strong>Temperature</strong> rescales the distribution before
              sampling. <code>t &lt; 1</code> sharpens it; <code>t &gt; 1</code>{" "}
              makes it more diverse.
            </p>
          </Concept>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/4gram/dashboard"
            className="text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100"
          >
            Back to dashboard
          </Link>
          <Link href="/">
            <Button variant="secondary">
              Back to start
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

function Concept({
  icon,
  label,
  title,
  tag,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-ink-200/70 bg-ink-50/70 dark:border-ink-800 dark:bg-ink-950/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-accent-400/30 bg-accent-400/10 p-2 text-accent-700 dark:text-accent-300">
              {icon}
            </div>
            <div>
              <CardDescription className="text-[10px] uppercase tracking-widest">
                {label}
              </CardDescription>
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
          </div>
          <Badge variant="default">{tag}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4 text-sm leading-7 text-ink-700 dark:text-ink-300 [&_code]:rounded [&_code]:bg-ink-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-ink-900 dark:[&_code]:bg-ink-950 dark:[&_code]:text-accent-200 [&_strong]:font-semibold [&_strong]:text-ink-950 dark:[&_strong]:text-ink-100">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Example({ before, after }: { before: string; after: string }) {
  return (
    <div className="my-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-800 dark:bg-ink-950">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
          Input
        </div>
        <code>{before}</code>
      </div>
      <div className="rounded-lg border border-accent-400/30 bg-accent-400/10 px-3 py-2 dark:bg-accent-400/5">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-accent-700 dark:text-accent-300">
          Output
        </div>
        <code>{after}</code>
      </div>
    </div>
  );
}

function Tile({ name, example }: { name: string; example: string }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50 px-2 py-2 text-center dark:border-ink-800 dark:bg-ink-950">
      <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {name}
      </div>
      <code className="text-xs">{example}</code>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs leading-6 text-ink-800 dark:border-ink-800 dark:bg-ink-950 dark:text-accent-200">
      {children}
    </pre>
  );
}
