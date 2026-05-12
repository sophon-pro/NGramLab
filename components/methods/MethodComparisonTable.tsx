import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";

const ROWS = [
  {
    method: "4-Gram",
    idea: "Predict from the previous three words.",
    strength: "Easy to inspect and explain.",
    limitation: "Struggles with unseen contexts.",
    bestFor: "Learning statistical text generation.",
  },
  {
    method: "TF-IDF",
    idea: "Score words by document importance.",
    strength: "Fast and transparent.",
    limitation: "Does not understand word meaning.",
    bestFor: "Search and keyword analysis.",
  },
  {
    method: "Word2Vec",
    idea: "Represent words as vectors.",
    strength: "Captures similarity between words.",
    limitation: "Needs enough training data.",
    bestFor: "Semantic comparison.",
  },
  {
    method: "Transformer",
    idea: "Use attention across context.",
    strength: "Handles long-range relationships.",
    limitation: "More complex and resource-heavy.",
    bestFor: "Modern language modeling.",
  },
  {
    method: "RAG",
    idea: "Retrieve documents before generation.",
    strength: "Can ground answers in sources.",
    limitation: "Depends on retrieval quality.",
    bestFor: "Question answering over documents.",
  },
];

export function MethodComparisonTable() {
  return (
    <section aria-labelledby="comparison-title">
      <Card>
        <CardHeader>
          <CardTitle id="comparison-title">Method Comparison Summary</CardTitle>
          <CardDescription>
            A concise view of where each method is useful and what to watch for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-y border-ink-200 bg-ink-50 text-left dark:border-ink-800 dark:bg-ink-950/60">
                  <th className="px-3 py-2 font-semibold">Method</th>
                  <th className="px-3 py-2 font-semibold">Main Idea</th>
                  <th className="px-3 py-2 font-semibold">Strength</th>
                  <th className="px-3 py-2 font-semibold">Limitation</th>
                  <th className="px-3 py-2 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.method} className="border-b border-ink-200 dark:border-ink-800">
                    <td className="px-3 py-3 font-medium">{row.method}</td>
                    <td className="px-3 py-3 text-ink-600 dark:text-ink-300">{row.idea}</td>
                    <td className="px-3 py-3 text-ink-600 dark:text-ink-300">{row.strength}</td>
                    <td className="px-3 py-3 text-ink-600 dark:text-ink-300">{row.limitation}</td>
                    <td className="px-3 py-3 text-ink-600 dark:text-ink-300">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
