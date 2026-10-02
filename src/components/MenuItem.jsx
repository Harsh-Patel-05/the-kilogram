import { Fragment } from 'react';
import { formatPrice, keepUnits } from '../data/menu.js';

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

export default function MenuItem({ item, cols }) {
  if (item.options) {
    return (
      <li className={`mi mi--cols mi--cols-${cols}`}>
        <Name item={item} />
        {item.options.map((o) => (
          <span key={o.label} className="mi__price">
            <span className="visually-hidden">{o.label}: </span>
            {formatPrice(o.price)}
          </span>
        ))}
      </li>
    );
  }

  return (
    <li className="mi mi--single">
      <Name item={item} />
      <span className="mi__leader" aria-hidden="true" />
      <span className="mi__price">{formatPrice(item.price)}</span>
    </li>
  );
}
