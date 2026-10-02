import { Fragment } from 'react';
import { hours } from '../data/site.js';

/** "All 7 days, 11 AM – 2 PM & 6 PM – 11 PM" with each time range kept on one line. */
export default function HoursText() {
  return (
    <>
      {hours.daysLabel},{' '}
      {hours.slots.map((slot, i) => (
        <Fragment key={slot.open}>
          {i > 0 && ' & '}
          <span className="nowrap">
            {slot.openLabel} – {slot.closeLabel}
          </span>
        </Fragment>
      ))}
    </>
  );
}
