import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type MapMarker = {
  key: string;
  name: string;
  address: string;
  facilityType: string;
  lat: number;
  lng: number;
  distanceLabel?: string;
};

function MapFit({
  markers,
  userPosition,
}: {
  markers: MapMarker[];
  userPosition: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = markers.map((m) => [m.lat, m.lng]);
    if (userPosition) {
      points.push(userPosition);
    }
    if (points.length === 0) {
      map.setView([40.7128, -74.006], 12);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0] as L.LatLngTuple, 13);
      return;
    }
    const bounds = L.latLngBounds(points as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, markers, userPosition]);

  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(t);
  }, [map, markers]);

  return null;
}

type FacilityMapProps = {
  markers: MapMarker[];
  userPosition: [number, number] | null;
  className?: string;
};

export function FacilityMap({
  markers,
  userPosition,
  className,
}: FacilityMapProps) {
  const center: [number, number] = userPosition ?? [40.7128, -74.006];

  return (
    <div className={className ?? "h-full w-full min-h-[320px] rounded-lg overflow-hidden border"}>
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFit markers={markers} userPosition={userPosition} />
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Your approximate location</Popup>
          </Marker>
        )}
        {markers.map((m) => (
          <Marker key={m.key} position={[m.lat, m.lng]}>
            <Popup>
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {m.address}
              </div>
              <div className="text-xs mt-1 capitalize">{m.facilityType}</div>
              {m.distanceLabel && (
                <div className="text-xs mt-1 font-medium">{m.distanceLabel}</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
