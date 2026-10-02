import { useRef } from 'react';
import useInView from '../hooks/useInView.js';
import useOpenStatus from '../hooks/useOpenStatus.js';
import './OpenStatus.css';

export default function OpenStatus({ className = '' }) {
  const { state, label, detail } = useOpenStatus();
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <p
      ref={ref}
      className={`open-status open-status--${state}${inView ? '' : ' is-offscreen'} ${className}`.trim()}
    >
      <span className="open-status__dot" aria-hidden="true" />
      <strong>{label}</strong>
      <span className="open-status__sep" aria-hidden="true">·</span>
      <span className="open-status__detail">{detail}</span>
    </p>
  );
}
