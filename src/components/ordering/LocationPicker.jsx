import { useCallback, useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search, X } from 'lucide-react';
import DeliveryMap from './DeliveryMap.jsx';
import { restaurantLocation } from '../../data/restaurantLocation.js';
import { checkDeliveryEligibility } from '../../lib/haversine.js';
import { reverseGeocode, searchAddresses, PHOTON_MIN_QUERY_LEN } from '../../lib/photon.js';
import './LocationPicker.css';

const emptyAddress = {
  fullName: '',
  mobile: '',
  flat: '',
  society: '',
  area: '',
  landmark: '',
  deliveryInstructions: '',
  formatted: '',
  latitude: null,
  longitude: null,
};

export default function LocationPicker({ value, onChange, onEligibilityChange }) {
  const [form, setForm] = useState(() => ({ ...emptyAddress, ...value }));
  const formRef = useRef(form);
  formRef.current = form;

  const [pin, setPin] = useState(
    value?.latitude != null ? { lat: value.latitude, lng: value.longitude } : null,
  );
  const [accuracyM, setAccuracyM] = useState(0);
  const [geoMsg, setGeoMsg] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [geocodeNote, setGeocodeNote] = useState('');
  const [eligibility, setEligibility] = useState(null);

  const pushChange = useCallback(
    (patchOrNext) => {
      setForm((prev) => {
        const next = typeof patchOrNext === 'function' ? patchOrNext(prev) : { ...prev, ...patchOrNext };
        formRef.current = next;
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const applyCoords = useCallback(
    async (lat, lng, { skipReverse = false, extra = {} } = {}) => {
      setPin({ lat, lng });
      setAccuracyM(0);
      const check = checkDeliveryEligibility(
        lat,
        lng,
        restaurantLocation,
        restaurantLocation.deliveryRadiusKm,
      );
      setEligibility(check);
      onEligibilityChange?.(check);

      let formatted = formRef.current.formatted;
      let area = formRef.current.area;

      if (!skipReverse) {
        setGeocodeNote('');
        const rev = await reverseGeocode(lat, lng);
        if (rev) {
          formatted = rev.label;
          area = area || rev.area || rev.city || '';
        } else {
          setGeocodeNote(
            'Address lookup is temporarily unavailable. Pin the map and enter your address manually.',
          );
        }
      }

      pushChange({
        ...extra,
        latitude: lat,
        longitude: lng,
        formatted: extra.formatted ?? formatted,
        area: extra.area ?? area,
      });
    },
    [onEligibilityChange, pushChange],
  );

  useEffect(() => {
    if (value?.latitude != null && value?.longitude != null) {
      const check = checkDeliveryEligibility(
        value.latitude,
        value.longitude,
        restaurantLocation,
        restaurantLocation.deliveryRadiusKm,
      );
      setEligibility(check);
      onEligibilityChange?.(check);
    }
    // hydrate eligibility once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (query.trim().length < PHOTON_MIN_QUERY_LEN) {
        setSuggestions([]);
        return;
      }
      setSearchBusy(true);
      const results = await searchAddresses(query, {
        lat: restaurantLocation.searchBias.lat,
        lon: restaurantLocation.searchBias.lon,
      });
      if (alive) {
        setSuggestions(results);
        setSearchBusy(false);
        if (!results.length) {
          setGeocodeNote(
            'No suggestions found (or search is busy). Tap the map or enter the address below.',
          );
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [query]);

  const useMyLocation = () => {
    setGeoMsg('');
    if (!navigator.geolocation) {
      setGeoMsg('GPS is not available on this device. Search or tap the map instead.');
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoBusy(false);
        setAccuracyM(pos.coords.accuracy || 0);
        await applyCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMsg('Location permission denied. Search for your address or tap the map.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoMsg('GPS unavailable. Search or select your spot on the map.');
        } else {
          setGeoMsg('Could not get your location. Try the map or address search.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  const field = (key) => (e) => pushChange({ [key]: e.target.value });

  const pickSuggestion = async (s) => {
    setQuery(s.label);
    setSuggestions([]);
    await applyCoords(s.lat, s.lng, {
      skipReverse: true,
      extra: {
        formatted: s.label,
        area: formRef.current.area || s.area || s.city || '',
      },
    });
  };

  return (
    <div className="kg-loc">
      <p className="kg-loc__intro">
        Drop a pin inside the yellow circle ({restaurantLocation.deliveryRadiusKm} km). GPS is
        optional — search or tap the map.
      </p>

      <div className="kg-loc__block">
        <p className="kg-loc__block-title">Set delivery pin</p>
        <div className="kg-loc__toolbar">
          <button
            type="button"
            className="btn btn--yellow kg-loc__gps"
            onClick={useMyLocation}
            disabled={geoBusy}
          >
            <LocateFixed aria-hidden="true" />
            <span>{geoBusy ? 'Detecting…' : 'Use my current location'}</span>
          </button>
          {geoMsg ? (
            <p className="kg-loc__note" role="status">
              {geoMsg}
            </p>
          ) : null}
        </div>

        <div className="kg-loc__search">
          <Search className="kg-loc__search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area or society"
            autoComplete="street-address"
            aria-label="Search address"
          />
          {query ? (
            <button
              type="button"
              className="kg-loc__search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
            >
              <X aria-hidden="true" />
            </button>
          ) : null}
          {suggestions.length > 0 ? (
            <ul className="kg-loc__suggest" role="listbox">
              {suggestions.map((s) => (
                <li key={`${s.lat}-${s.lng}-${s.label}`}>
                  <button type="button" onClick={() => pickSuggestion(s)}>
                    <MapPin aria-hidden="true" />
                    <span>{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {searchBusy ? <p className="kg-loc__hint">Searching…</p> : null}
        </div>

        <DeliveryMap pin={pin} accuracyM={accuracyM} onPick={(lat, lng) => applyCoords(lat, lng)} />

        {eligibility ? (
          <p
            className={`kg-loc__eligible${eligibility.eligible ? ' is-ok' : ' is-no'}`}
            role="status"
          >
            {eligibility.message}
          </p>
        ) : null}
        {geocodeNote ? (
          <p className="kg-loc__note" role="status">
            {geocodeNote}
          </p>
        ) : null}
        {accuracyM > 0 ? (
          <p className="kg-loc__hint">GPS accuracy ≈ {Math.round(accuracyM)} m</p>
        ) : null}
      </div>

      <div className="kg-loc__block">
        <p className="kg-loc__block-title">Delivery address</p>
        <div className="kg-loc__fields">
          <label>
            <span>Full name</span>
            <input
              required
              value={form.fullName}
              onChange={field('fullName')}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
          <label>
            <span>Mobile number</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9+\s-]{10,15}"
              value={form.mobile}
              onChange={field('mobile')}
              autoComplete="tel"
              placeholder="10-digit mobile"
            />
          </label>
          <label className="kg-loc__full">
            <span>Flat / House / Floor / Building</span>
            <input
              required
              value={form.flat}
              onChange={field('flat')}
              autoComplete="address-line1"
              placeholder="House no. / floor"
            />
          </label>
          <label>
            <span>Society / Apartment</span>
            <input
              value={form.society}
              onChange={field('society')}
              autoComplete="address-line2"
              placeholder="Optional"
            />
          </label>
          <label>
            <span>Area</span>
            <input required value={form.area} onChange={field('area')} placeholder="Area / locality" />
          </label>
          <label className="kg-loc__full">
            <span>Landmark</span>
            <input value={form.landmark} onChange={field('landmark')} placeholder="Optional" />
          </label>
          <label className="kg-loc__full">
            <span>Delivery instructions</span>
            <textarea
              rows={2}
              value={form.deliveryInstructions}
              onChange={field('deliveryInstructions')}
              placeholder="Gate code, landmark tips…"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
