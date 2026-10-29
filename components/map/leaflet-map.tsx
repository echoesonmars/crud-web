"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { FeatureCollection, Feature, Polygon, MultiPolygon, Position } from "geojson";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { PLACEHOLDER_CAMERAS } from "./placeholder-cameras";

type AreaKey = "district" | "city";

interface AreaConfig {
  label: string;
  title: string;
  subtitle: string;
  url: string;
  bounds: LatLngBoundsExpression;
  maxBounds: LatLngBoundsExpression;
}

// Границы из OpenStreetMap: район — relation 5550509, город — relation 3389772
const AREAS: Record<AreaKey, AreaConfig> = {
  district: {
    label: "Аль-Фараби",
    title: "Аль-Фарабийский район",
    subtitle: "г. Шымкент",
    url: "/data/al-farabi.geojson",
    bounds: [[42.1090, 69.4836], [42.3480, 69.6521]],
    maxBounds: [[42.05, 69.38], [42.41, 69.76]],
  },
  city: {
    label: "Весь город",
    title: "г. Шымкент",
    subtitle: "Все районы",
    url: "/data/shymkent.geojson",
    bounds: [[42.1090, 69.3018], [42.4794, 69.9357]],
    maxBounds: [[42.03, 69.18], [42.56, 70.06]],
  },
};

const AREA_KEYS: AreaKey[] = ["district", "city"];

// Перелетает к выбранной области и ограничивает перетаскивание её рамкой
function FitArea({ area }: { area: AreaConfig }) {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(undefined);
    map.flyToBounds(area.bounds, { duration: 0.8 });
    map.once("moveend", () => map.setMaxBounds(area.maxBounds));
  }, [map, area]);
  return null;
}

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
  const [areaKey, setAreaKey] = useState<AreaKey>("district");
  const [boundaries, setBoundaries] = useState<Partial<Record<AreaKey, FeatureCollection>>>({});

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

    AREA_KEYS.forEach((key) => {
      fetch(AREAS[key].url)
        .then(res => res.json())
        .then(data => setBoundaries(prev => ({ ...prev, [key]: data })))
        .catch(err => console.error(`Error loading ${key} GeoJSON`, err));
    });

    return () => observer.disconnect();
  }, []);

  const area = AREAS[areaKey];
  const boundary = boundaries[areaKey];
  const district = boundaries.district;
  const outsideMask = useMemo(() => (boundary ? buildOutsideMask(boundary) : null), [boundary]);

  const accent = theme === "dark" ? "#34d399" : "#15803d";

  const tileUrl = theme === "dark"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="absolute left-4 top-4 z-[1000] flex flex-col gap-2 rounded-md border border-border bg-background/90 p-2 shadow-sm backdrop-blur">
        <div className="px-1">
          <div className="text-sm font-semibold text-foreground">{area.title}</div>
          <div className="text-xs text-muted-foreground">{area.subtitle}</div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-secondary/40 p-1">
          {AREA_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAreaKey(key)}
              className={`h-7 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors ${
                areaKey === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {AREAS[key].label}
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        bounds={AREAS.district.bounds}
        maxBounds={AREAS.district.maxBounds}
        maxBoundsViscosity={1}
        zoomSnap={0.25}
        minZoom={10}
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
        <FitArea area={area} />

        {outsideMask && (
          <GeoJSON
            key={`mask-${areaKey}-${theme}`}
            data={outsideMask}
            interactive={false}
            style={{
              stroke: false,
              fillColor: theme === "dark" ? "#000000" : "#1f2937",
              fillOpacity: theme === "dark" ? 0.6 : 0.35,
            }}
          />
        )}

        {boundary && (
          <GeoJSON
            key={`boundary-${areaKey}-${theme}`}
            data={boundary}
            interactive={false}
            style={{ fill: false, weight: 3, color: accent }}
          />
        )}

        {/* В режиме «весь город» район остаётся виден пунктиром */}
        {areaKey === "city" && district && (
          <GeoJSON
            key={`district-hint-${theme}`}
            data={district}
            interactive={false}
            style={{ fill: false, weight: 1.5, dashArray: "6 4", color: accent }}
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
