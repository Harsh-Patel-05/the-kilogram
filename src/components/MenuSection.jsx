import { useEffect, useMemo, useRef, useState } from 'react';
import { Phone, Search, X } from 'lucide-react';
import MenuCategory from './MenuCategory.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { filterMenu } from '../lib/menuSearch.js';
import { MENU_JUMP_EVENT } from '../lib/menuNav.js';
import { site } from '../data/site.js';
import './MenuSection.css';

const ALL = 'all';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MenuSection() {
  const { menuGroups, loading, error, itemCount } = useMenu();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(ALL);
  const listRef = useRef(null);
  const chipsRef = useRef(null);
  const inputRef = useRef(null);
  const pendingJump = useRef(false);

  const suggestions = useMemo(() => {
    const names = menuGroups
      .flatMap((g) => g.categories.flatMap((c) => c.items.map((i) => i.name)))
      .filter(Boolean);
    const uniq = [...new Set(names.map((n) => n.split(/\s+/)[0]))].slice(0, 4);
    return uniq.length ? uniq : ['Bhaji', 'Pulao', 'Paneer', 'Dal'];
  }, [menuGroups]);

  const { groups: matched, count } = useMemo(() => filterMenu(menuGroups, query), [menuGroups, query]);
  const searching = count !== null;
  const availableIds = useMemo(() => new Set(matched.map((g) => g.id)), [matched]);
  const effectiveActive = active !== ALL && availableIds.has(active) ? active : ALL;
  const visible = effectiveActive === ALL ? matched : matched.filter((g) => g.id === effectiveActive);

  const scrollToList = (force = false) => {
    const list = listRef.current;
    if (!list) return;
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const offset = headerH + (chipsRef.current?.offsetHeight ?? 0) + 8;
    const top = list.getBoundingClientRect().top;
    if (force || top < offset) {
      window.scrollTo({
        top: window.scrollY + top - offset,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  };

  const centerChip = (id) => {
    const scroller = chipsRef.current?.querySelector('.menu__chips');
    const chip = scroller?.querySelector(`[data-chip="${id}"]`);
    if (!chip) return;
    scroller.scrollTo({
      left: chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const selectChip = (id) => {
    setActive(id);
    centerChip(id);
    scrollToList();
  };

  useEffect(() => {
    const onJump = (e) => {
      pendingJump.current = true;
      setQuery('');
      setActive(e.detail);
    };
    window.addEventListener(MENU_JUMP_EVENT, onJump);
    return () => window.removeEventListener(MENU_JUMP_EVENT, onJump);
  }, []);

  useEffect(() => {
    if (!pendingJump.current) return;
    pendingJump.current = false;
    centerChip(active);
    requestAnimationFrame(() => scrollToList(true));
  }, [active, query]);

  const onSearchChange = (e) => {
    setQuery(e.target.value);
    if (active !== ALL) setActive(ALL);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    inputRef.current?.blur();
    scrollToList();
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const statusText = loading
    ? 'Loading live menu…'
    : error
      ? 'Couldn’t load the live menu.'
      : searching
        ? count === 0
          ? `No dishes match “${query.trim()}”`
          : `${count} ${count === 1 ? 'dish matches' : 'dishes match'} “${query.trim()}”`
        : itemCount
          ? `${itemCount} dishes · updated live from the kitchen`
          : '';

  return (
    <section id="menu" className="section menu" aria-labelledby="menu-title">
      <div className="container">
        <div className="section-head section-head--center menu__head" data-reveal>
          <p className="eyebrow">Takeaway menu</p>
          <h2 id="menu-title" className="section-title">
            Our Menu
          </h2>
          <p className="section-sub">Pick your favourites. Choose your portion. Order online.</p>
        </div>

        <form className="menu__search" role="search" onSubmit={onSearchSubmit}>
          <label htmlFor="menu-search" className="visually-hidden">
            Search dishes
          </label>
          <Search className="menu__search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            id="menu-search"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck="false"
            placeholder="Search dishes..."
            value={query}
            onChange={onSearchChange}
            disabled={loading || !!error || !itemCount}
          />
          {query && (
            <button type="button" className="menu__search-clear" onClick={clearSearch} aria-label="Clear search">
              <X aria-hidden="true" />
            </button>
          )}
        </form>

        {!loading && !error && itemCount > 0 && (
          <div className="menu__chipbar" ref={chipsRef}>
            <div className="menu__chips" role="group" aria-label="Menu categories">
              {[{ id: ALL, label: 'All' }, ...menuGroups]
                .filter((g) => g.id === ALL || availableIds.has(g.id))
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    data-chip={g.id}
                    className={`chip${effectiveActive === g.id ? ' is-active' : ''}`}
                    aria-pressed={effectiveActive === g.id}
                    onClick={() => selectChip(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        <p className="menu__status" aria-live="polite">
          {statusText}
        </p>

        <div ref={listRef} className="menu__list" key={effectiveActive}>
          {loading && (
            <div className="menu__empty" role="status">
              <p className="menu__empty-title">Loading menu…</p>
              <p>Pulling the latest dishes from the kitchen.</p>
            </div>
          )}

          {!loading && error && (
            <div className="menu__empty" role="alert">
              <p className="menu__empty-title">Menu is temporarily unavailable.</p>
              <p>Please refresh the page, or call us to place your order.</p>
              <p>
                <a className="btn btn--red" href={site.phoneHref}>
                  <Phone aria-hidden="true" />
                  Call {site.phoneDisplay}
                </a>
              </p>
            </div>
          )}

          {!loading && !error && !itemCount && (
            <div className="menu__empty">
              <p className="menu__empty-title">No dishes published yet.</p>
              <p>Add items in the restaurant Menu page — they’ll show here automatically.</p>
            </div>
          )}

          {!loading &&
            !error &&
            visible.map((group) => {
              const multi = group.categories.length > 1;
              const single = !multi && group.categories[0].title === group.heading;
              return (
                <section
                  key={group.id}
                  className={`menu-group${multi ? ' is-multi' : ''}`}
                  aria-labelledby={`mg-${group.id}`}
                >
                  <h3 id={`mg-${group.id}`} className="menu-group__title">
                    {group.heading}
                  </h3>
                  <div className={`menu-group__cats${multi ? ' is-multi' : ''}`}>
                    {group.categories.map((category) => (
                      <MenuCategory
                        key={category.id}
                        category={category}
                        showTitle={!single}
                        headingId={`mc-${category.id}`}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          {!loading && !error && searching && count === 0 && (
            <div className="menu__empty">
              <p className="menu__empty-title">We couldn’t find that one.</p>
              <p>Check the spelling, or try one of these:</p>
              <div className="menu__empty-chips">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <p>
                Still not sure? <a href={site.phoneHref}>Call us on {site.phoneDisplay}</a> and ask.
              </p>
            </div>
          )}
        </div>

        <aside className="menu__footnote" data-reveal>
          <p>
            <strong>Cooked in groundnut oil only.</strong> We use Amul dairy products.
          </p>
          <a className="btn btn--red" href={site.phoneHref}>
            <Phone aria-hidden="true" />
            Call {site.phoneDisplay}
          </a>
        </aside>
      </div>
    </section>
  );
}
