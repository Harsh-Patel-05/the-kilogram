import { Fragment } from 'react';
import { Plus } from 'lucide-react';
import { formatPrice, keepUnits } from '../data/menu.js';
import { useCustomize } from '../context/CustomizeContext.jsx';

function Name({ item }) {
  const parts = item.name.split(' + ');
  return (
    <span className="mi__name">
      {item.section && <span className="visually-hidden">{item.section}: </span>}
      {parts.length > 1
        ? parts.map((part, i) => (
            <Fragment key={part}>
              {i > 0 && ' '}
              <span className="nowrap">
                {i > 0 && '+ '}
                {part}
              </span>
            </Fragment>
          ))
        : keepUnits(item.name)}
    </span>
  );
}

export default function MenuItem({ item, cols, categoryId }) {
  const { openCustomize } = useCustomize();

  const open = (preselectLabel = null) => {
    openCustomize({
      name: item.name,
      categoryId: categoryId || null,
      section: item.section || null,
      options: item.options || null,
      basePrice: item.price,
      preselectLabel,
    });
  };

  if (item.options) {
    return (
      <li className={`mi mi--cols mi--cols-${cols}`}>
        <Name item={item} />
        {item.options.map((o) => (
          <button
            key={o.label}
            type="button"
            className="mi__price mi__add"
            onClick={() => open(o.label)}
            aria-label={`Customize ${item.name} ${o.label} for ${formatPrice(o.price)}`}
          >
            <span className="visually-hidden">{o.label}: </span>
            {formatPrice(o.price)}
            <Plus aria-hidden="true" />
          </button>
        ))}
      </li>
    );
  }

  return (
    <li className="mi mi--single">
      <Name item={item} />
      <span className="mi__leader" aria-hidden="true" />
      <button
        type="button"
        className="mi__price mi__add"
        onClick={() => open(null)}
        aria-label={`Customize ${item.name} for ${formatPrice(item.price)}`}
      >
        {formatPrice(item.price)}
        <Plus aria-hidden="true" />
      </button>
    </li>
  );
}
