'use client';

import Image from 'next/image';
import { useRef } from 'react';

const restaurants = [
  {
    name: 'Gezellig',
    cuisine: 'Contemporary Canadian',
    price: '$$',
    rating: '⭐⭐⭐⭐⭐',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'North & Navy',
    cuisine: 'Northern Italian',
    price: '$$',
    rating: '⭐⭐⭐⭐⭐',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Stofa',
    cuisine: 'Fine Dining',
    price: '$$$',
    rating: '⭐⭐⭐⭐⭐',
    image:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Soca Kitchen',
    cuisine: 'Latin American',
    price: '$$',
    rating: '⭐⭐⭐⭐⭐',
    image:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Pure Kitchen',
    cuisine: 'Plant-Based',
    price: '$$',
    rating: '⭐⭐⭐⭐⭐',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'
  }
];

export default function RestaurantCarousel() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollByCard(direction: 'left' | 'right') {
    if (!trackRef.current) {
      return;
    }

    const card = trackRef.current.querySelector<HTMLElement>('.landing-carousel__card');
    const amount = card ? card.offsetWidth + 16 : 320;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  }

  return (
    <section className="landing-section">
      <div className="landing-shell">
        <div className="landing-section__heading landing-section__heading--row reveal-on-scroll">
          <div>
            <h2>Featured Ottawa Restaurants</h2>
            <p>Explore top spots with verified reviews and live availability.</p>
          </div>
          <div className="landing-carousel__controls">
            <button type="button" onClick={() => scrollByCard('left')} aria-label="Scroll left">
              ←
            </button>
            <button type="button" onClick={() => scrollByCard('right')} aria-label="Scroll right">
              →
            </button>
          </div>
        </div>

        <div className="landing-carousel reveal-on-scroll" ref={trackRef}>
          {restaurants.map((restaurant) => (
            <article className="landing-carousel__card" key={restaurant.name}>
              <Image
                src={restaurant.image}
                alt={`${restaurant.name} dining room`}
                width={800}
                height={600}
                loading="lazy"
                className="landing-carousel__image"
              />
              <div className="landing-carousel__body">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <p>
                  {restaurant.price} | {restaurant.rating}
                </p>
                <span className="landing-availability">Available Tonight</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
