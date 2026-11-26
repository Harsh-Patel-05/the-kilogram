import { Fragment } from 'react';
import { Plus } from 'lucide-react';
import MenuItem from './MenuItem.jsx';
import { formatPrice, keepUnits } from '../data/menu.js';
import { useCustomize } from '../context/CustomizeContext.jsx';

function SharedPriceCategory({ category }) {
  const { openCustomize } = useCustomize();

  return (
    <>
      <ul className="mc__portions" aria-label="Portion prices for every dish in this list">
        {category.sharedOptions.map((o) => (
          <li key={o.label} className="portion">
            <span className="portion__label">{o.label}</span>
            {o.serves && <span className="portion__serves">{o.serves}</span>}
            <span className="portion__price">{formatPrice(o.price)}</span>
          </li>
        ))}
      </ul>
      <ul className="mc__names mc__names--orderable">
        {category.items.map((item) => (
          <li key={item.name}>
            <span className="mc__dish">
              {item.name}
              {item.tag && (
                <span className={`mc__tag mc__tag--${item.tag.toLowerCase()}`}>{item.tag}</span>
              )}
            </span>
            <span className="mc__add-row">
              {category.sharedOptions.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className="mi__add mc__add-btn"
                  aria-label={`Customize ${item.name} ${o.label}`}
                  onClick={() =>
                    openCustomize({
                      name: item.name,
                      categoryId: category.id,
                      options: category.sharedOptions,
                      preselectLabel: o.label,
                    })
                  }
                >
                  {o.label}
                  <Plus aria-hidden="true" />
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ItemList({ category }) {
  const withOptions = category.items.find((i) => i.options);
  const columns = withOptions ? withOptions.options.map((o) => o.label) : null;

  return (
    <>
      {columns && (
        <div className={`mc__cols mi--cols mi--cols-${columns.length}`} aria-hidden="true">
          <span />
          {columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      )}
      <ul className="mc__items">
        {category.items.map((item, i) => {
          const showSection = item.section && item.section !== category.items[i - 1]?.section;
          return (
            <Fragment key={item.name}>
              {showSection && (
                <li className="mi-section" aria-hidden="true">
                  {item.section}
                </li>
              )}
              <MenuItem item={item} cols={columns?.length} categoryId={category.id} />
            </Fragment>
          );
        })}
      </ul>
    </>
  );
}

export default function MenuCategory({ category, showTitle = true, headingId }) {
  return (
    <article className="mc" aria-labelledby={headingId}>
      <h4 id={headingId} className={showTitle ? 'mc__title' : 'visually-hidden'}>
        {category.title}
      </h4>
      {category.sharedOptions ? <SharedPriceCategory category={category} /> : <ItemList category={category} />}
      {category.note && <p className="mc__note">{keepUnits(category.note)}</p>}
    </article>
  );
}
