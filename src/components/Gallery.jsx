import noodles from '../assets/food/hakka-noodles.webp';
import kaju from '../assets/food/kaju-curry.webp';
import manchurian from '../assets/food/manchurian.webp';
import biryani from '../assets/food/veg-biryani.webp';
import dal from '../assets/food/dal.webp';
import chilliPotato from '../assets/food/honey-chilli-potato.webp';
import paratha from '../assets/food/butter-paratha.webp';
import soup from '../assets/food/manchow-soup.webp';
import kiloNoodles from '../assets/food/noodles.webp';
import './Gallery.css';

const photos = [
  { src: noodles, w: 366, h: 462, caption: 'Hakka Noodles', alt: 'Hakka noodles tossed with capsicum and onion', size: 'tall' },
  { src: kaju, w: 295, h: 371, caption: 'Kaju Curry', alt: 'Kaju curry in a copper handi with a swirl of cream' },
  { src: soup, w: 451, h: 359, caption: 'Man Chow Soup', alt: 'Man chow soup topped with crispy fried noodles', size: 'wide' },
  { src: manchurian, w: 359, h: 451, caption: 'Manchurian', alt: 'Dry manchurian balls with spring onion' },
  { src: biryani, w: 273, h: 342, caption: 'Veg Biryani', alt: 'Vegetable biryani topped with fried onions', size: 'tall' },
  { src: chilliPotato, w: 359, h: 451, caption: 'Honey Chilli Potato', alt: 'Honey chilli potato with sesame seeds' },
  { src: dal, w: 272, h: 342, caption: 'Dal Tadka', alt: 'Yellow dal tempered with a dried red chilli' },
  { src: paratha, w: 273, h: 343, caption: 'Butter Paratha', alt: 'A stack of parathas with butter on top' },
  { src: kiloNoodles, w: 489, h: 452, caption: 'Chinese on Kilo', alt: 'A bowl of noodles with peppers and chopsticks' },
];

export default function Gallery() {
  return (
    <section className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head gallery__head" data-reveal>
          <p className="eyebrow">
            From our kitchen
          </p>
          <h2 id="gallery-title" className="section-title">
            A few things <em>worth ordering</em>
          </h2>
        </div>

        <ul className="gallery__grid">
          {photos.map((p, i) => (
            <li
              key={p.caption}
              className={`gallery__item${p.size ? ` gallery__item--${p.size}` : ''}`}
              data-reveal
              style={{ '--reveal-delay': i % 4 }}
            >
              <figure>
                <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
                <figcaption>{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
