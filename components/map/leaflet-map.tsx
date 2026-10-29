"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { FeatureCollection, Feature, Polygon, MultiPolygon, Position } from "geojson";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { PLACEHOLDER_CAMERAS } from "./placeholder-cameras";

// Аль-Фарабийский район г. Шымкента (граница из OpenStreetMap, relation 5550509)
const DISTRICT_BOUNDS: LatLngBoundsExpression = [
  [42.1090, 69.4836],
  [42.3480, 69.6521],
];
const MAX_BOUNDS: LatLngBoundsExpression = [
  [42.05, 69.38],
  [42.41, 69.76],
];

const getStatusLabelAndClass = (status: string) => {
  switch (status) {
    case "stable":
      return {
        label: "Стабильно",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      };
    case "warning":
      return {
        label: "Предупреждение",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      };
    case "critical":
    default:
      return {
        label: "Критично",
        className: "bg-red-500/10 text-red-600 dark:text-red-400"
      };
  }
};

const customMarkerIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="relative flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary shadow-md transition-transform duration-200 hover:scale-125">
          <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
        </div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Полигон «весь мир с дыркой в форме района» — затемняет всё вокруг района
const buildOutsideMask = (district: FeatureCollection): Feature<Polygon> | null => {
  const geometry = district.features[0]?.geometry as Polygon | MultiPolygon | undefined;
  if (!geometry) return null;
  const holes: Position[][] =
    geometry.type === "Polygon"
      ? [geometry.coordinates[0]]
      : geometry.coordinates.map((polygon) => polygon[0]);
  const world: Position[] = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [world, ...holes] },
  };
};

export default function LeafletMap() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [district, setDistrict] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    // Determine theme from document class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Initial check
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    fetch('/data/al-farabi.geojson')
      .then(res => res.json())
      .then(data => setDistrict(data))
      .catch(err => console.error("Error loading district GeoJSON", err));

    return () => observer.disconnect();
  }, []);

  const outsideMask = useMemo(() => (district ? buildOutsideMask(district) : null), [district]);

  const accent = theme === "dark" ? "#34d399" : "#15803d";

  const tileUrl = theme === "dark"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="absolute left-4 top-4 z-[1000] rounded-md border border-border bg-background/90 px-3 py-2 shadow-sm backdrop-blur">
        <div className="text-sm font-semibold text-foreground">Аль-Фарабийский район</div>
        <div className="text-xs text-muted-foreground">г. Шымкент</div>
      </div>

      <MapContainer
        bounds={DISTRICT_BOUNDS}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={1}
        zoomSnap={0.25}
        minZoom={11}
        maxZoom={18}
        attributionControl={false}
        zoomControl={false}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", background: theme === "dark" ? "#0f0f0f" : "#f8f9fa" }}
      >
        <TileLayer key={theme} url={tileUrl} maxZoom={18} />
        {theme === "dark" && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        <ZoomControl position="topright" />

        {outsideMask && (
          <GeoJSON
            key={`mask-${theme}`}
            data={outsideMask}
            interactive={false}
            style={{
              stroke: false,
              fillColor: theme === "dark" ? "#000000" : "#1f2937",
              fillOpacity: theme === "dark" ? 0.6 : 0.35,
            }}
          />
        )}

        {district && (
          <GeoJSON
            key={`district-${theme}`}
            data={district}
            interactive={false}
            style={{ fill: false, weight: 3, color: accent }}
          />
        )}

        {PLACEHOLDER_CAMERAS.map((camera) => {
          const statusInfo = getStatusLabelAndClass(camera.status);
          return (
            <Marker
              key={camera.id}
              position={[camera.latitude, camera.longitude]}
              icon={customMarkerIcon()}
            >
              <Popup className="custom-premium-popup font-sans">
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-sm text-foreground">{camera.name}</h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-muted-foreground border-t pt-2 border-border/60">
                    <div className="flex justify-between">
                      <span>Координаты:</span>
                      <span className="font-medium text-foreground">
                        {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div>Заглушка — реальная камера ещё не привязана</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
