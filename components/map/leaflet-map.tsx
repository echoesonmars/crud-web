"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Layer, LeafletMouseEvent, Path } from "leaflet";
import type { FeatureCollection, Feature } from "geojson";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const KAZAKHSTAN_CENTER: [number, number] = [48.0196, 66.9237];
const ZOOM_LEVEL = 5;

interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  connections: number;
  latency: number;
  loadPercent: number;
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
        <!-- Static border and core dot -->
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

export default function LeafletMap() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [cities, setCities] = useState<MapPoint[]>([]);

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

    fetch('/data/kazakhstan-regions.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON", err));

    fetch('/api/map-points')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data);
        }
      })
      .catch(err => console.error("Error loading map points", err));

    return () => observer.disconnect();
  }, []);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target as Path;
        target.setStyle({
          fillColor: theme === "dark" ? "#10b981" : "#16a34a",
          fillOpacity: 0.2,
          weight: 2,
          color: theme === "dark" ? "#34d399" : "#15803d"
        });
        target.bringToFront();
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target as Path;
        target.setStyle({
          fillColor: theme === "dark" ? "#10b981" : "#16a34a",
          fillOpacity: 0.05,
          weight: 1.5,
          color: theme === "dark" ? "rgba(16,185,129,0.4)" : "rgba(22,163,74,0.4)"
        });
      },
    });

    const regionName = feature.properties?.NAME_1 || feature.properties?.name || "Регион";
    layer.bindTooltip(regionName, {
      sticky: true,
      className: "font-sans font-medium rounded-md shadow-sm border border-border"
    });
  };

  const tileUrl = theme === "dark" 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: "calc(100vh - 64px)" }}>
      <MapContainer
        center={KAZAKHSTAN_CENTER}
        zoom={ZOOM_LEVEL}
        minZoom={4}
        maxZoom={12}
        attributionControl={false} // Disable watermark!
        zoomControl={false} // Disable default zoom to position it elsewhere if needed
        className="w-full h-full"
        style={{ width: "100%", height: "100%", background: theme === "dark" ? "#0f0f0f" : "#f8f9fa" }}
      >
        <TileLayer url={tileUrl} />
        <ZoomControl position="topright" />
        
        {geoData && (
          <GeoJSON 
            key={theme} // Force re-render when theme changes to update base border color
            data={geoData} 
            style={{
              fillColor: theme === "dark" ? "#10b981" : "#16a34a",
              fillOpacity: 0.05,
              weight: 1.5,
              color: theme === "dark" ? "rgba(16,185,129,0.4)" : "rgba(22,163,74,0.4)"
            }}
            onEachFeature={onEachFeature} 
          />
        )}
        
        {cities.map((city) => {
          const statusInfo = getStatusLabelAndClass(city.status);
          return (
            <Marker 
              key={city.id} 
              position={[city.latitude, city.longitude] as [number, number]}
              icon={customMarkerIcon()}
            >
              <Popup className="custom-premium-popup font-sans">
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-sm text-foreground">{city.name}</h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] text-muted-foreground border-t pt-2 border-border/60">
                    <div className="flex justify-between">
                      <span>Подключения:</span>
                      <span className="font-medium text-foreground">{city.connections} ед.</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Задержка:</span>
                      <span className="font-medium text-foreground">{city.latency} мс</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Нагрузка:</span>
                      <span className="font-medium text-foreground">{city.loadPercent}%</span>
                    </div>
                  </div>
                  
                  <button className="mt-3 w-full inline-flex items-center justify-center rounded-md text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3 transition-colors cursor-pointer">
                    Панель аналитики
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
