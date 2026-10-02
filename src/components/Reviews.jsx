import { ArrowUpRight, Quote } from 'lucide-react';
import { ratings, reviews } from '../data/site.js';
import './Reviews.css';

const STAR = 'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z';

function Stars({ value, label }) {
  const row = (
    <svg viewBox="0 0 120 24" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
      ))}
    </svg>
  );
  return (
    <span className="stars" role="img" aria-label={label}>
      <span className="stars__base">{row}</span>
      <span className="stars__fill" style={{ width: `${(value / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  );
}

export default function Reviews() {
  const { google } = ratings;

  return (
    <section id="reviews" className="section reviews" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <p className="eyebrow">Reviews</p>
          <h2 id="reviews-title" className="section-title">
            Don’t take <em>our word</em> for it.
          </h2>
          <p className="section-sub">A few things people have said about us online.</p>
        </div>

        <div className="reviews__layout">
          <div className="reviews__score" data-reveal>
            <p className="reviews__source">Rated on Google</p>
            <p className="reviews__number">
              {google.score.toFixed(1)}
              <span>/ 5</span>
            </p>
            <div className="reviews__meta">
              <Stars value={google.score} label={`${google.score} out of 5 stars`} />
              <p className="reviews__count">from {google.countLabel} Google reviews</p>
            </div>

            <div className="reviews__links">
              <a className="btn btn--yellow" href={google.href} target="_blank" rel="noopener noreferrer">
                Read Google reviews
                <ArrowUpRight aria-hidden="true" />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a
                className="reviews__textlink"
                href={ratings.zomatoReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                See reviews on Zomato
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </div>

          <ul className="reviews__list h-scroll" aria-label="Customer reviews">
            {reviews.map((r, i) => (
              <li key={r.name} className="review" data-reveal style={{ '--reveal-delay': i }}>
                <figure>
                  <Quote className="review__mark" aria-hidden="true" />
                  <Stars value={r.stars} label={`${r.stars} out of 5 stars`} />
                  <blockquote className="review__text">
                    <p>{r.text}</p>
                  </blockquote>
                  <figcaption className="review__who">
                    <span className="review__avatar" aria-hidden="true">
                      {r.name[0]}
                    </span>
                    <span>
                      <strong>{r.name}</strong>
                      <small>Review on {r.source}</small>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
