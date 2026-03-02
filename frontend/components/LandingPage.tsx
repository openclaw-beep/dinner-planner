'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import ComparisonTable from './ComparisonTable';
import FeaturesShowcase from './FeaturesShowcase';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import RestaurantCarousel from './RestaurantCarousel';
import Testimonials from './Testimonials';

function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -64px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

function RestaurantSignupCta() {
  return (
    <section className="landing-section landing-section--cta">
      <div className="landing-shell reveal-on-scroll">
        <div className="landing-cta">
          <h2>Are you a restaurant owner?</h2>
          <p>Join Dinner Planner. Pay only 5% (vs OpenTable&apos;s 30%)</p>
          <Link href="/signup/restaurant" className="landing-button-primary">
            List Your Restaurant
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell landing-footer__inner">
        <nav aria-label="Footer links" className="landing-footer__links">
          <Link href="/about">About</Link>
          <Link href="/landing#features">Features</Link>
          <Link href="/search">Restaurants</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <div className="landing-footer__social">
          <a href="#" aria-label="Twitter">
            Twitter
          </a>
          <a href="#" aria-label="Instagram">
            Instagram
          </a>
        </div>
        <p className="landing-footer__copyright">© 2026 Dinner Planner</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useRevealOnScroll();

  return (
    <main className="landing-page" id="features">
      <HeroSection />
      <HowItWorks />
      <FeaturesShowcase />
      <RestaurantCarousel />
      <ComparisonTable />
      <Testimonials />
      <RestaurantSignupCta />
      <Footer />
    </main>
  );
}
