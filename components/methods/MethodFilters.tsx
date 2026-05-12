"use client";

import { Search } from "lucide-react";
import {
  METHOD_CATEGORIES,
  METHOD_DIFFICULTIES,
  METHOD_STATUSES,
  type MethodCategory,
  type MethodDifficulty,
  type MethodStatus,
} from "@/data/methods";

export type MethodFilterState = {
  search: string;
  category: "All" | MethodCategory;
  difficulty: "All" | MethodDifficulty;
  status: "All" | MethodStatus;
};

export function MethodFilters({
  value,
  onChange,
}: {
  value: MethodFilterState;
  onChange: (next: MethodFilterState) => void;
}) {
  return (
    <section
      aria-labelledby="method-filters-title"
      className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm dark:border-ink-800 dark:bg-ink-900/60"
    >
      <div className="mb-3">
        <h2 id="method-filters-title" className="font-display text-lg font-semibold">
          Search and filter
        </h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Narrow the catalog by method name, category, difficulty, or demo status.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={value.search}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
              placeholder="Search methods"
              className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-400 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-100"
            />
          </div>
        </label>

        <FilterSelect
          label="Category"
          value={value.category}
          options={["All", ...METHOD_CATEGORIES]}
          onChange={(category) =>
            onChange({ ...value, category: category as MethodFilterState["category"] })
          }
        />
        <FilterSelect
          label="Difficulty"
          value={value.difficulty}
          options={["All", ...METHOD_DIFFICULTIES]}
          onChange={(difficulty) =>
            onChange({ ...value, difficulty: difficulty as MethodFilterState["difficulty"] })
          }
        />
        <FilterSelect
          label="Demo availability"
          value={value.status}
          options={["All", ...METHOD_STATUSES]}
          onChange={(status) =>
            onChange({ ...value, status: status as MethodFilterState["status"] })
          }
        />
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-400 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
