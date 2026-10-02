import useOpenStatus from '../hooks/useOpenStatus.js';
import './OpenStatus.css';

export default function OpenStatus({ className = '' }) {
  const { state, label, detail } = useOpenStatus();

  return (
    <p className={`open-status open-status--${state} ${className}`.trim()}>
      <span className="open-status__dot" aria-hidden="true" />
      <strong>{label}</strong>
      <span className="open-status__sep" aria-hidden="true">·</span>
      <span className="open-status__detail">{detail}</span>
    </p>
  );
}
