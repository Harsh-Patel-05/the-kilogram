import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Loader2 } from 'lucide-react';
import { restaurantLocation } from '../../data/restaurantLocation.js';
import 'leaflet/dist/leaflet.css';
import './DeliveryMap.css';

const restaurantIcon = L.divIcon({
  className: 'kg-map-icon kg-map-icon--restaurant',
  html: '<span aria-hidden="true">KG</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pinIcon = L.divIcon({
  className: 'kg-map-icon kg-map-icon--pin',
  html: '<span aria-hidden="true"></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 38],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

function MapClick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggablePin({ position, onDragEnd }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current;
        if (!m) return;
        const { lat, lng } = m.getLatLng();
        onDragEnd?.(lat, lng);
      },
    }),
    [onDragEnd],
  );

  if (!position) return null;
  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={pinIcon}
    />
  );
}

export default function DeliveryMap({
  pin,
  accuracyM,
  onPick,
  loading,
  error,
}) {
  const rest = [restaurantLocation.latitude, restaurantLocation.longitude];
  const pinPos = pin?.lat != null ? [pin.lat, pin.lng] : null;
  const [view, setView] = useState(pinPos || rest);

  useEffect(() => {
    if (pinPos) setView(pinPos);
  }, [pin?.lat, pin?.lng]);

  const recenter = () => {
    const target = pinPos || rest;
    setView([...target]);
  };

  return (
    <div className="kg-map">
      {loading && (
        <div className="kg-map__overlay" role="status">
          <Loader2 className="kg-spin" aria-hidden="true" />
          <span>Loading map…</span>
        </div>
      )}
      {error && !loading && (
        <div className="kg-map__overlay kg-map__overlay--error" role="alert">
          <p>{error}</p>
          <p className="kg-map__hint">You can still search or tap the map once it loads.</p>
        </div>
      )}

      <MapContainer
        center={view}
        zoom={15}
        className="kg-map__canvas"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapController center={view} zoom={pinPos ? 16 : 14} />
        <MapClick onPick={onPick} />
        <Marker position={rest} icon={restaurantIcon} />
        <Circle
          center={rest}
          radius={restaurantLocation.deliveryRadiusKm * 1000}
          pathOptions={{
            color: '#f8be3b',
            weight: 1.5,
            fillColor: '#f8be3b',
            fillOpacity: 0.08,
          }}
        />
        <DraggablePin position={pinPos} onDragEnd={onPick} />
        {pinPos && accuracyM > 0 && (
          <Circle
            center={pinPos}
            radius={Math.min(accuracyM, 200)}
            pathOptions={{ color: '#3aaae1', weight: 1, fillOpacity: 0.12 }}
          />
        )}
      </MapContainer>

      <button type="button" className="kg-map__recenter" onClick={recenter} aria-label="Recenter map">
        <Crosshair aria-hidden="true" />
      </button>
    </div>
  );
}
