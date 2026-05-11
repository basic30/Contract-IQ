"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths for Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// A red icon to represent the User's live location
const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper to smoothly animate the map when the user location changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function Map({ userLocation, offices }: { userLocation: [number, number]; offices: any[] }) {
  return (
    <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%", zIndex: 10 }}>
      <MapController center={userLocation} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Show User's Live Location */}
      <Marker position={userLocation} icon={userIcon}>
        <Popup className="font-semibold text-primary">📍 You are here</Popup>
      </Marker>

      {/* Dynamically Render Nearby Offices from the List */}
      {offices.map((office) => (
        <Marker key={office.id} position={office.coordinates} icon={icon}>
          <Popup>
            <strong className="text-sm">{office.name}</strong>
            <br />
            <span className="text-xs text-muted-foreground">{office.type}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}