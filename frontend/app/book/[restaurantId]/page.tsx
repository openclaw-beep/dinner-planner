"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createBooking, createUser } from "@/lib/api";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { writeUserSession } from "@/lib/user-session";

function formatDisplayTime(time: string): string {
  const isoTimeMatch = time.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!isoTimeMatch) return time;

  const [, rawHours, minutes] = isoTimeMatch;
  const hourValue = Number(rawHours);
  const period = hourValue >= 12 ? "PM" : "AM";
  const hourDisplay = hourValue % 12 || 12;
  return `${hourDisplay}:${minutes} ${period}`;
}

function normalizeTimeForIso(time: string): string {
  const trimmed = time.trim();
  const fullMatch = trimmed.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (fullMatch) {
    const [, hours, minutes, seconds] = fullMatch;
    return `${hours}:${minutes}:${seconds}`;
  }

  const shortMatch = trimmed.match(/^(\d{2}):(\d{2})$/);
  if (shortMatch) {
    const [, hours, minutes] = shortMatch;
    return `${hours}:${minutes}:00`;
  }

  return "";
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams<{ restaurantId: string }>();
  const searchParams = useSearchParams();

  const restaurantId = Number(params.restaurantId);
  const date = searchParams.get("date") ?? "";
  const initialTime = searchParams.get("time") ?? "";
  const partySize = Number(searchParams.get("partySize") ?? "2");
  const restaurantName = searchParams.get("restaurantName") ?? `Restaurant #${restaurantId}`;
  const restaurantAddress = searchParams.get("restaurantAddress") ?? "Address unavailable";
  const restaurantCity = searchParams.get("restaurantCity") ?? "";

  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reservationISO = useMemo(() => {
    if (!date || !selectedTime) {
      return "";
    }

    const normalizedTime = normalizeTimeForIso(selectedTime);
    if (!normalizedTime) {
      return "";
    }

    const reservationDate = new Date(`${date}T${normalizedTime}`);
    if (Number.isNaN(reservationDate.getTime())) {
      return "";
    }

    return reservationDate.toISOString();
  }, [date, selectedTime]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTime) {
      setError("Select an available time slot before confirming your booking.");
      return;
    }

    if (!reservationISO || Number.isNaN(restaurantId) || Number.isNaN(partySize)) {
      setError("Booking details are incomplete. Return to search and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = await createUser({
        name,
        phone_number: phoneNumber,
      });
      writeUserSession({ userId: user.id, authToken: user.auth_token });

      const booking = await createBooking({
        restaurant_id: restaurantId,
        reservation_at: reservationISO,
        party_size: partySize,
      });

      const confirmationQuery = new URLSearchParams({
        restaurantName,
        restaurantAddress,
        restaurantCity,
        phone: phoneNumber,
      });

      if (specialRequests.trim()) {
        confirmationQuery.set("specialRequests", specialRequests.trim());
      }

      router.push(`/confirmation/${booking.id}?${confirmationQuery.toString()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to confirm booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr,1fr]">
        <article className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <p className="text-xs uppercase tracking-wider text-ink/60">Confirm Details</p>
          <h1 className="mt-2 text-3xl font-bold">{restaurantName}</h1>
          <dl className="mt-5 space-y-3 text-sm text-ink/80">
            <div>
              <dt className="font-semibold">Date & Time</dt>
              <dd>
                {date} at {selectedTime ? formatDisplayTime(selectedTime) : "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Party Size</dt>
              <dd>{partySize} guests</dd>
            </div>
            <div>
              <dt className="font-semibold">Address</dt>
              <dd>{restaurantAddress}</dd>
              <dd>{restaurantCity}</dd>
            </div>
          </dl>
        </article>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-semibold">Guest Information</h2>
          <p className="mt-2 text-sm text-ink/70">Your booking will be created with pending status.</p>

          <div className="mt-6">
            <TimeSlotPicker
              restaurantId={restaurantId}
              date={date}
              selectedTime={selectedTime}
              onSelectTime={(time) => {
                setSelectedTime(time);
                setError(null);
              }}
            />
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-ink/80">
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/20 px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                placeholder="Alex Johnson"
              />
            </label>

            <label className="block text-sm font-medium text-ink/80">
              Phone Number
              <input
                required
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/20 px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                placeholder="+1 555-123-4567"
              />
            </label>

            <label className="block text-sm font-medium text-ink/80">
              Special Requests
              <textarea
                rows={4}
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/20 px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                placeholder="Window seat, allergy notes, celebration details"
              />
            </label>
          </div>

          {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>
      </section>
    </main>
  );
}
