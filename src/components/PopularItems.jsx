import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { startingOffer, formatPrice } from '../data/menu.js';
import { useMenu } from '../context/MenuContext.jsx';
import { jumpToMenuGroup } from '../lib/menuNav.js';
import bhajiPau from '../assets/food/bhaji-pau.webp';
import pulao from '../assets/food/pulao.webp';
import paneer from '../assets/food/paneer-butter-masala.webp';
import chinese from '../assets/food/paneer-chilly.webp';
import punjabi from '../assets/food/punjabi-veg.webp';
import combo from '../assets/food/combo-plate.webp';
import noodles from '../assets/food/hakka-noodles.webp';
import dal from '../assets/food/dal.webp';
import './PopularItems.css';

const IMAGE_MAP = [
  { match: /bhaji|pau|pav/, img: bhajiPau, alt: 'Bhaji with toasted pau' },
  { match: /pulao|pulav/, img: pulao, alt: 'Vegetable pulao' },
  { match: /combo/, img: combo, alt: 'Family combo plate' },
  { match: /noodle|rice/, img: noodles, alt: 'Hakka noodles' },
  { match: /chinese|manchurian|soup/, img: chinese, alt: 'Indo-Chinese dish' },
  { match: /paneer|punjabi|kaju/, img: paneer, alt: 'Paneer curry' },
  { match: /dal|bread|roti/, img: dal, alt: 'Dal tadka' },
  { match: /./, img: punjabi, alt: 'Punjabi vegetarian curry' },
];

function pickImage(group) {
  const blob = `${group.id} ${group.label} ${group.heading}`.toLowerCase();
  return IMAGE_MAP.find((row) => row.match.test(blob)) || IMAGE_MAP[IMAGE_MAP.length - 1];
}

function groupBlurb(group) {
  const names = group.categories.flatMap((c) => c.items.map((i) => i.name)).slice(0, 3);
  if (!names.length) return 'Fresh from our kitchen — pick your portion and order online.';
  if (names.length === 1) return `Including ${names[0]} and more from this section.`;
  return `Including ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`;
}

export default function PopularItems() {
  const { menuGroups, loading, error } = useMenu();

  const cards = useMemo(() => {
    return menuGroups.slice(0, 6).map((group) => {
      const offer = startingOffer([group.id, ...group.categories.map((c) => c.id)], [group]);
      const media = pickImage(group);
      return {
        id: group.id,
        name: group.label,
        text: groupBlurb(group),
        img: media.img,
        alt: media.alt,
        offer,
        isCombo: /combo/i.test(group.id) || /combo/i.test(group.label),
      };
    });
  }, [menuGroups]);

  if (loading || error || !cards.length) return null;

  return (
    <section className="section popular" aria-labelledby="popular-title">
      <div className="container">
        <div className="section-head popular__head" data-reveal>
          <p className="eyebrow">Start here</p>
          <h2 id="popular-title" className="section-title">
            The ones people <em>keep ordering</em>
          </h2>
          <p className="section-sub">Not sure what to get? Jump into a live menu section.</p>
        </div>

        <ul className="popular__list h-scroll" data-reveal>
          {cards.map((f) => {
            const onClick = (e) => {
              e.preventDefault();
              if (f.isCombo && document.getElementById('combos')) {
                document.getElementById('combos').scrollIntoView({ behavior: 'smooth' });
                return;
              }
              jumpToMenuGroup(f.id);
            };

            return (
              <li key={f.id} className="popular__item">
                <article className="pcard">
                  <div className="pcard__media">
                    <img src={f.img} alt={f.alt} width="360" height="300" loading="lazy" decoding="async" />
                  </div>
                  <div className="pcard__body">
                    <h3 className="pcard__name">{f.name}</h3>
                    <p className="pcard__text">{f.text}</p>
                    <div className="pcard__foot">
                      {f.offer.price != null && (
                        <p className="pcard__price">
                          <span className="pcard__from">From</span>
                          <strong>{formatPrice(f.offer.price)}</strong>
                          {f.offer.label && <span className="pcard__unit">/ {f.offer.label}</span>}
                        </p>
                      )}
                      <a className="pcard__link" href="#menu" onClick={onClick}>
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
