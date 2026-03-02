"use client";

import { AMBIANCE_OPTIONS, CUISINE_OPTIONS, DIETARY_OPTIONS, PRICE_OPTIONS, PriceTier } from "@/lib/restaurant-filters";

type SearchFiltersState = {
  cuisines: string[];
  prices: PriceTier[];
  dietaryOptions: string[];
  outdoorSeating: boolean;
  ambiance: string[];
};

type SearchFiltersProps = {
  value: SearchFiltersState;
  onChange: (nextValue: SearchFiltersState) => void;
  onClearAll: () => void;
};

function toggleArrayValue<T extends string>(values: T[], target: T): T[] {
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

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Price Range</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((option) => {
            const isActive = value.prices.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    prices: toggleArrayValue(value.prices, option),
                  })
                }
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  isActive ? "border-pine bg-pine text-white" : "border-ink/20 bg-white text-ink hover:border-pine/40 hover:bg-pine/5"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Dietary</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((option) => {
            const isActive = value.dietaryOptions.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    dietaryOptions: toggleArrayValue(value.dietaryOptions, option.value),
                  })
                }
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-amber-700 bg-amber-700 text-white"
                    : "border-ink/20 bg-white text-ink hover:border-amber-700/40 hover:bg-amber-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Seating</p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              outdoorSeating: !value.outdoorSeating,
            })
          }
          className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            value.outdoorSeating
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-ink/20 bg-white text-ink hover:border-emerald-700/40 hover:bg-emerald-50"
          }`}
        >
          <span aria-hidden>{value.outdoorSeating ? "🌿" : "🪑"}</span>
          <span>Outdoor Seating</span>
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Ambiance</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMBIANCE_OPTIONS.map((option) => {
            const isActive = value.ambiance.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    ambiance: toggleArrayValue(value.ambiance, option.value),
                  })
                }
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-rose-700 bg-rose-700 text-white"
                    : "border-ink/20 bg-white text-ink hover:border-rose-700/40 hover:bg-rose-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export type { SearchFiltersState };
