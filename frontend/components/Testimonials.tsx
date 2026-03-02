'use client';

const testimonials = [
  {
    quote: 'Best way to find last-minute tables in Westboro!',
    author: 'Sarah M.'
  },
  {
    quote: "Finally, a platform that doesn't charge crazy fees",
    author: 'Restaurant Owner'
  },
  {
    quote: 'The WhatsApp booking is a game-changer',
    author: 'Tech User'
  }
];

export default function Testimonials() {
  return (
    <section className="landing-section">
      <div className="landing-shell">
        <div className="landing-section__heading reveal-on-scroll">
          <h2>What People Are Saying</h2>
          <p>Early feedback from diners and operators across Ottawa.</p>
        </div>

        <div className="landing-grid landing-grid--three">
          {testimonials.map((item) => (
            <blockquote key={item.quote} className="landing-card reveal-on-scroll">
              <p>&ldquo;{item.quote}&rdquo;</p>
              <footer>{item.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
