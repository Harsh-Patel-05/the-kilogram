import { ArrowRight } from 'lucide-react';
import { startingOffer, formatPrice } from '../data/menu.js';
import { jumpToMenuGroup } from '../lib/menuNav.js';
import bhajiPau from '../assets/food/bhaji-pau.webp';
import pulao from '../assets/food/pulao.webp';
import paneer from '../assets/food/paneer-butter-masala.webp';
import chinese from '../assets/food/paneer-chilly.webp';
import punjabi from '../assets/food/punjabi-veg.webp';
import combo from '../assets/food/combo-plate.webp';
import './PopularItems.css';

const favourites = [
  {
    name: 'Bhaji Pau',
    text: 'Regular, Jain, Swaminarayan, paneer or our special bhaji. Add pau by the 6 or 12.',
    img: bhajiPau,
    alt: 'Bhaji topped with butter, served with toasted pau, onion and lemon',
    categories: ['bhaji'],
    group: 'bhaji-pulao',
  },
  {
    name: 'Pulao',
    text: 'From regular and Jain to Kashmiri and dry fruit pulao, by the half kilo or kilo.',
    img: pulao,
    alt: 'A plate of spiced vegetable pulao with paneer',
    categories: ['pulao'],
    group: 'bhaji-pulao',
  },
  {
    name: 'Paneer',
    text: 'Eighteen paneer curries — butter masala, kadai, lababdar, toofani and more.',
    img: paneer,
    alt: 'Paneer butter masala in a bowl with a swirl of cream',
    categories: ['punjabi-paneer'],
    group: 'punjabi',
  },
  {
    name: 'Chinese',
    text: 'Manchurian, paneer chilly, crispy corn, chilli potato and hot soups.',
    img: chinese,
    alt: 'Paneer chilly dry with capsicum and spring onion',
    categories: ['soups', 'chinese-paneer', 'manchurian', 'chatpata-starters'],
    group: 'chinese',
  },
  {
    name: 'Punjabi',
    text: 'Fifteen veg tadka dishes like veg kadai, dum aloo and chana masala.',
    img: punjabi,
    alt: 'A green Punjabi vegetable curry topped with grated paneer',
    categories: ['punjabi-veg-tadka'],
    group: 'punjabi',
  },
  {
    name: 'Family Combos',
    text: 'Bhaji, pau and pulao in one order — from a quick bite to the full family spread.',
    img: combo,
    alt: 'Bhaji, pau and pulao served together on one tray',
    categories: ['family-combos'],
    href: '#combos',
  },
];

export default function PopularItems() {
  return (
    <section className="section popular" aria-labelledby="popular-title">
      <div className="container">
        <div className="section-head popular__head" data-reveal>
          <p className="eyebrow">
            Start here
          </p>
          <h2 id="popular-title" className="section-title">
            The ones people <em>keep ordering</em>
          </h2>
          <p className="section-sub">Not sure what to get? These are a safe bet for any table.</p>
        </div>

        <ul className="popular__list h-scroll" data-reveal>
          {favourites.map((f) => {
            const offer = startingOffer(f.categories);
            const href = f.href ?? '#menu';
            const onClick = f.group
              ? (e) => {
                  e.preventDefault();
                  jumpToMenuGroup(f.group);
                }
              : undefined;

            return (
              <li key={f.name} className="popular__item">
                <article className="pcard">
                  <div className="pcard__media">
                    <img src={f.img} alt={f.alt} width="360" height="300" loading="lazy" decoding="async" />
                  </div>
                  <div className="pcard__body">
                    <h3 className="pcard__name">{f.name}</h3>
                    <p className="pcard__text">{f.text}</p>
                    <div className="pcard__foot">
                      <p className="pcard__price">
                        <span className="pcard__from">From</span>
                        <strong>{formatPrice(offer.price)}</strong>
                        {offer.label && <span className="pcard__unit">/ {offer.label}</span>}
                      </p>
                      <a className="pcard__link" href={href} onClick={onClick}>
                        View menu
                        <span className="visually-hidden"> for {f.name}</span>
                        <ArrowRight aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
