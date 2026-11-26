import useOnlineOrdering from '../hooks/useOnlineOrdering.js';
import { DELIVERY_PHONE_DISPLAY, DELIVERY_PHONE_HREF } from '../data/restaurantLocation.js';
import './OnlineOrderingBanner.css';

export default function OnlineOrderingBanner() {
  const status = useOnlineOrdering();
  if (status.enabled) return null;

  return (
    <div className="kg-online-banner" role="status">
      <div className="kg-online-banner__inner">
        <strong>{status.label}</strong>
        <p>{status.detail}</p>
        <a href={DELIVERY_PHONE_HREF}>Call {DELIVERY_PHONE_DISPLAY}</a>
      </div>
    </div>
  );
}
