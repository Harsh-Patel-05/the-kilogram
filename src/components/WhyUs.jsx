import './WhyUs.css';

const PortionIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M8 21h32l-3 15a4 4 0 0 1-4 3H15a4 4 0 0 1-4-3z" fill="var(--yellow)" opacity="0.18" />
    <path d="M8 21h32l-3 15a4 4 0 0 1-4 3H15a4 4 0 0 1-4-3z" stroke="var(--yellow)" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 21c0-6 5-10 11-10s11 4 11 10" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M18 14.5c1.5-2 3.5-3 6-3M31 9l3-3M24 7V3M17 9l-3-3" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" />
    <text x="24" y="33.5" textAnchor="middle" fill="var(--red)" fontSize="9" fontWeight="800" fontFamily="var(--font-body)">KG</text>
  </svg>
);

const FreshIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M10 22h28v10a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z" fill="var(--blue)" opacity="0.18" />
    <path d="M10 22h28v10a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8zM6 22h36M10 27H6M38 27h4" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 16c-2-2.5 2-4 0-7M24 16c-2-2.5 2-4 0-7M30 16c-2-2.5 2-4 0-7" stroke="var(--yellow)" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const VegIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="7" y="7" width="34" height="34" rx="6" stroke="var(--yellow)" strokeWidth="2.2" />
    <circle cx="24" cy="24" r="8" fill="var(--yellow)" opacity="0.25" />
    <circle cx="24" cy="24" r="8" stroke="var(--yellow)" strokeWidth="2.2" />
    <path d="M24 28v-6c0-3 2-5 5-5-0.5 3-2.5 5-5 5" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FamilyIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <ellipse cx="24" cy="30" rx="18" ry="8" fill="var(--red)" opacity="0.16" />
    <ellipse cx="24" cy="30" rx="18" ry="8" stroke="var(--red)" strokeWidth="2.2" />
    <ellipse cx="24" cy="29" rx="7" ry="3" stroke="var(--yellow)" strokeWidth="2" />
    <circle cx="10" cy="12" r="3.5" stroke="var(--blue)" strokeWidth="2.2" />
    <circle cx="24" cy="9" r="3.5" stroke="var(--blue)" strokeWidth="2.2" />
    <circle cx="38" cy="12" r="3.5" stroke="var(--blue)" strokeWidth="2.2" />
  </svg>
);

const reasons = [
  {
    Icon: PortionIcon,
    title: 'Generous portions',
    text: 'Most dishes come by the 500 gm or 1 kg, so there’s enough to go round — and maybe some for tomorrow.',
  },
  {
    Icon: FreshIcon,
    title: 'Freshly prepared',
    text: 'Made in our kitchen in groundnut oil, with Amul dairy, and packed for you to take home.',
  },
  {
    Icon: VegIcon,
    title: 'Wide vegetarian selection',
    text: 'Bhaji, pulao, Indo-Chinese, Punjabi, paneer, kaju, dal and biryani. Jain and Swaminarayan options too.',
  },
  {
    Icon: FamilyIcon,
    title: 'Perfect for family meals',
    text: 'Combos put bhaji, pulao and pau in one order, so feeding everyone is one phone call.',
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="section why" aria-labelledby="why-title">
      <div className="container">
        <hr className="section-rule why__divider" />

        <div className="section-head section-head--center" data-reveal>
          <p className="eyebrow">Why The Kilogram</p>
          <h2 id="why-title" className="section-title">
            Good food. <span className="nowrap">Generous portions.</span> <em>No fuss.</em>
          </h2>
        </div>

        <ul className="why__list">
          {reasons.map(({ Icon, title, text }, i) => (
            <li key={title} className="why__item" data-reveal style={{ '--reveal-delay': i }}>
              <span className="why__icon">
                <Icon />
              </span>
              <h3 className="why__title">{title}</h3>
              <p className="why__text">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
