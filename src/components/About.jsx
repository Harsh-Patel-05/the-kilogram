import bhajiImg from '../assets/food/bhaji-pau.webp';
import pulaoImg from '../assets/food/pulao.webp';
import './About.css';

const range = ['Bhaji', 'Pulao', 'Chinese', 'Punjabi', 'Paneer', 'Rice', 'Family meals'];

export default function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__media" data-reveal>
          <figure className="about__main frame">
            <img
              src={bhajiImg}
              alt="Bhaji topped with butter, served with buttered pau, onions and lemon"
              width="359"
              height="451"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <figure className="about__small">
            <img
              src={pulaoImg}
              alt="Vegetable pulao with paneer and peas, garnished with coriander"
              width="359"
              height="451"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <p className="about__stamp" aria-hidden="true">
            <span className="about__stamp-small">by the</span>
            <span className="about__stamp-big">Kilo</span>
          </p>
        </div>

        <div className="about__copy" data-reveal style={{ '--reveal-delay': 1 }}>
          <p className="eyebrow">
            About The Kilogram
          </p>
          <h2 id="about-title" className="section-title">
            Familiar food. <em>Proper portions.</em>
          </h2>
          <div className="about__text">
            <p>
              At The Kilogram, the idea is simple — familiar food, generous portions and flavours made for
              sharing.
            </p>
            <p>
              The menu runs from buttery bhaji and pau to pulao, Indo-Chinese starters, noodles and fried rice,
              Punjabi sabzis, paneer and kaju curries, dal, biryani and rotis. Most of it comes by the 500 gm or
              the kilo, because food tastes better when there’s enough on the table for everyone.
            </p>
            <p>
              Everything is vegetarian and cooked in groundnut oil, with Amul for our dairy. Jain and
              Swaminarayan bhaji and pulao are on the menu too.
            </p>
          </div>
          <ul className="about__range" aria-label="What we make">
            {range.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
