import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";

const PATH = [
  "Bigram",
  "Trigram",
  "4-Gram",
  "Markov Chain",
  "TF-IDF",
  "Word2Vec",
  "RNN",
  "LSTM",
  "Transformer",
  "RAG",
];

export function LearningPath() {
  return (
    <section id="learning-path" aria-labelledby="learning-path-title">
      <Card>
        <CardHeader>
          <CardTitle id="learning-path-title">Recommended Learning Path</CardTitle>
          <CardDescription>
            Start with simple statistical models before moving to neural and
            transformer-based methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {PATH.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm dark:border-ink-800 dark:bg-ink-950/40"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-400 text-xs font-semibold text-ink-950">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
                {index < PATH.length - 1 && (
                  <ArrowRight className="ml-auto hidden h-3.5 w-3.5 text-ink-400 lg:block" />
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
