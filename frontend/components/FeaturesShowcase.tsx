'use client';

const features = [
  {
    title: 'Real-Time Availability',
    description:
      'See exactly when tables are free. Green (available), Amber (limited), Gray (full)'
  },
  {
    title: 'Advanced Filters',
    description: 'Cuisine, price, outdoor seating, vegan, gluten-free, ambiance'
  },
  {
    title: 'Verified Reviews',
    description: 'Only real diners can review. 100% authentic feedback'
  },
  {
    title: 'Loyalty Rewards (coming soon)',
    description: 'Earn 50 points per booking. Redeem for discounts'
  },
  {
    title: 'WhatsApp Booking (coming soon)',
    description: "Book via voice: 'Reserve Gezellig Friday at 7'"
  }
];

export default function FeaturesShowcase() {
  return (
    <section className="landing-section landing-section--tinted">
      <div className="landing-shell">
        <div className="landing-section__heading reveal-on-scroll">
          <h2>Feature Highlights</h2>
          <p>Everything your diners and restaurant partners need in one platform.</p>
        </div>

        <div className="landing-feature-list">
          {features.map((feature) => (
            <article key={feature.title} className="landing-feature-item reveal-on-scroll">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
