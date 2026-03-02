'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__bg-shape landing-hero__bg-shape--one" aria-hidden="true" />
      <div className="landing-hero__bg-shape landing-hero__bg-shape--two" aria-hidden="true" />

      <div className="landing-shell landing-hero__content reveal-on-scroll is-visible">
        <div className="landing-hero__copy">
          <p className="landing-badge">Ottawa-First Restaurant Booking</p>
          <h1>Find Your Perfect Table in Ottawa</h1>
          <p className="landing-hero__subheadline">
            Book verified restaurants instantly. Real reviews. Real availability. 5% commission (vs OpenTable&apos;s 30%)
          </p>
          <div className="landing-hero__cta-row">
            <Link href="/search" className="landing-button-primary">
              Search Restaurants Now
            </Link>
          </div>
        </div>

        <div className="landing-hero__image-card">
          <Image
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80"
            alt="Guests enjoying dinner at a modern restaurant"
            width={1200}
            height={900}
            priority
            className="landing-hero__image"
          />
          <div className="landing-hero__stats">
            5 Restaurants | 142 Bookings | 4.8★ Average Rating
          </div>
        </div>
      </div>
    </section>
  );
}
