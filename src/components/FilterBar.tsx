import type { Filter, Todo } from "@/lib/types";

interface FilterBarProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  remaining: number;
  hasCompleted: boolean;
  onClearCompleted: () => void;
}

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function FilterBar({
  filter,
  onFilterChange,
  remaining,
  hasCompleted,
  onClearCompleted,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
      <span
        id="todo-count"
        className="text-sm text-[var(--muted)]"
        aria-live="polite"
      >
        {remaining} {remaining === 1 ? "item" : "items"} left
      </span>

      <div
        role="tablist"
        aria-label="Filter todos"
        className="flex gap-1 rounded-lg border border-[var(--border)] p-1"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => onFilterChange(f.value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--border)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={!hasCompleted}
        aria-label="Clear completed todos"
        className="text-sm text-[var(--muted)] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear completed
      </button>
    </div>
  );
}