"use client";

import Link from "next/link";
import {
  Brain,
  Database,
  FileSearch,
  GitBranch,
  Layers,
  Network,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";
import type { MethodCategory, NlpMethod } from "@/data/methods";

const CATEGORY_ICONS: Record<MethodCategory, LucideIcon> = {
  "Statistical Language Model": GitBranch,
  "Vector Space Model": FileSearch,
  "Embedding Model": Layers,
  "Neural Language Model": Brain,
  "Transformer Model": Sparkles,
  "Retrieval-Based Model": Database,
};

export function MethodCard({
  method,
  onLearnMore,
}: {
  method: NlpMethod;
  onLearnMore: (method: NlpMethod) => void;
}) {
  const Icon = CATEGORY_ICONS[method.category] ?? Network;
  const available = method.status === "Interactive Demo Available";

  return (
    <Card className="group h-full transition-colors hover:border-accent-400/50 hover:shadow-soft">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-400/30 bg-accent-400/10 text-accent-700 dark:text-accent-300">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant={available ? "success" : "default"}>{method.status}</Badge>
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {method.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="accent">{method.category}</Badge>
            <Badge variant={method.difficulty === "Advanced" ? "warn" : "default"}>
              {method.difficulty}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-ink-300">
            {method.description}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            What you can inspect
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-600 dark:text-ink-300">
            {method.inspectItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {available && method.route ? (
            <Link href={method.route}>
              <Button>Open Demo</Button>
            </Link>
          ) : (
            <Button disabled aria-label={`${method.name} demo coming soon`}>
              Coming Soon
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onLearnMore(method)}
            disabled={!available}
            aria-label={
              available
                ? `Learn more about ${method.name}`
                : `${method.name} methodology coming soon`
            }
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
