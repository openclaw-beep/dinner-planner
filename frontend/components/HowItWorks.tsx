'use client';

const steps = [
  {
    icon: '🔍',
    title: 'Search & Filter',
    description: 'Search by date, time, cuisine, price, dietary needs'
  },
  {
    icon: '⏰',
    title: 'Pick Your Time',
    description: 'See real-time availability. Choose your perfect timeslot'
  },
  {
    icon: '✅',
    title: 'Book Instantly',
    description: 'Get confirmation code. Earn rewards. Dine & review'
  }
];

export default function HowItWorks() {
  return (
    <section className="landing-section">
      <div className="landing-shell">
        <div className="landing-section__heading reveal-on-scroll">
          <h2>How It Works</h2>
          <p>From search to seated in less than a minute.</p>
        </div>

        <div className="landing-grid landing-grid--three">
          {steps.map((step) => (
            <article key={step.title} className="landing-card reveal-on-scroll">
              <div className="landing-card__icon" aria-hidden="true">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
