"use client";

import { CUISINE_OPTIONS } from "@/lib/restaurant-filters";

type SearchFiltersState = {
  cuisines: string[];
  prices: string[];
  dietaryOptions: string[];
  outdoorSeating: boolean;
  ambiance: string[];
};

type SearchFiltersProps = {
  value: SearchFiltersState;
  onChange: (nextValue: SearchFiltersState) => void;
  onClearAll: () => void;
};

function toggleArrayValue(values: string[], target: string): string[] {
  if (values.includes(target)) {
    return values.filter((value) => value !== target);
  }

  return [...values, target];
}

export function SearchFilters({ value, onChange, onClearAll }: SearchFiltersProps) {
  const activeFilterCount =
    value.cuisines.length + value.prices.length + value.dietaryOptions.length + value.ambiance.length + Number(value.outdoorSeating);

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/80">Advanced Filters</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{activeFilterCount} active</span>
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Cuisine</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((option) => {
            const isActive = value.cuisines.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    cuisines: toggleArrayValue(value.cuisines, option.value),
                  })
                }
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? "border-brand bg-brand text-white" : "border-ink/20 bg-white text-ink hover:border-brand/40 hover:bg-brand/5"
                }`}
              >
                <span aria-hidden>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export type { SearchFiltersState };
