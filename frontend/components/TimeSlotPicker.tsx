"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AvailabilitySlot, AvailabilityStatus, getRestaurantAvailability } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type TimeSlotPickerProps = {
  restaurantId: number;
  date: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
};

type PickerSlot = AvailabilitySlot & {
  label: string;
};

function normalizeStatus(value: string): AvailabilityStatus {
  if (value === "full") return "full";
  if (value === "limited") return "limited";
  return "available";
}

function formatTimeLabel(time: string): string {
  const trimmed = time.trim();
  const isoTimeMatch = trimmed.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

  if (isoTimeMatch) {
    const [, hoursRaw, minutes] = isoTimeMatch;
    const hours24 = Number(hoursRaw);
    const hours12 = hours24 % 12 || 12;
    const period = hours24 >= 12 ? "PM" : "AM";
    return `${hours12}:${minutes} ${period}`;
  }

  return trimmed;
}

function toPickerSlot(slot: AvailabilitySlot): PickerSlot {
  return {
    time: slot.time,
    status: normalizeStatus(slot.status),
    spots_left: typeof slot.spots_left === "number" ? slot.spots_left : null,
    label: formatTimeLabel(slot.time),
  };
}

export function TimeSlotPicker({ restaurantId, date, selectedTime, onSelectTime }: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<PickerSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (!date || Number.isNaN(restaurantId)) {
      setSlots([]);
      setError("Select a valid date to view availability.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getRestaurantAvailability(restaurantId, date);
      const normalized = (response.slots ?? []).map(toPickerSlot);
      setSlots(normalized);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load availability.");
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [date, restaurantId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const hasAvailableSlots = useMemo(() => slots.some((slot) => slot.status !== "full"), [slots]);

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">Choose a Time</h3>
        <p className="text-xs uppercase tracking-wide text-ink/60">{date || "No date selected"}</p>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-ink/10 bg-white/80 p-4">
          <LoadingSpinner label="Loading available times..." />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`slot-skeleton-${index}`}
                className="h-11 animate-pulse rounded-full bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadSlots()}
            className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 transition hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && slots.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/70">
          No availability published for this date.
        </p>
      ) : null}

      {!isLoading && !error && slots.length > 0 ? (
        <div className="mt-4">
          {!hasAvailableSlots ? (
            <p className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              All time slots are currently full.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isDisabled = slot.status === "full";
              const stateClasses =
                slot.status === "available"
                  ? "border-pine/20 bg-pine/15 text-pine hover:bg-pine/25"
                  : slot.status === "limited"
                    ? "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
                    : "border-slate-300 bg-slate-100 text-slate-500 line-through";
              const selectedClasses = isSelected ? "ring-2 ring-brand ring-offset-1" : "";

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectTime(slot.time)}
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-80 ${stateClasses} ${selectedClasses}`}
                >
                  {slot.label}
                  {slot.status === "limited" && typeof slot.spots_left === "number" ? ` (${slot.spots_left} left)` : ""}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
