// Временные точки камер внутри Аль-Фарабийского района, пока нет реальных координат
export interface PlaceholderCamera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "stable" | "warning" | "critical";
}

export const PLACEHOLDER_CAMERAS: PlaceholderCamera[] = [
  { id: "cam-01", name: "Камера 01", latitude: 42.340, longitude: 69.635, status: "stable" },
  { id: "cam-02", name: "Камера 02", latitude: 42.333, longitude: 69.625, status: "stable" },
  { id: "cam-03", name: "Камера 03", latitude: 42.325, longitude: 69.612, status: "warning" },
  { id: "cam-04", name: "Камера 04", latitude: 42.318, longitude: 69.600, status: "stable" },
  { id: "cam-05", name: "Камера 05", latitude: 42.310, longitude: 69.610, status: "stable" },
  { id: "cam-06", name: "Камера 06", latitude: 42.300, longitude: 69.595, status: "critical" },
  { id: "cam-07", name: "Камера 07", latitude: 42.290, longitude: 69.580, status: "stable" },
  { id: "cam-08", name: "Камера 08", latitude: 42.275, longitude: 69.570, status: "stable" },
  { id: "cam-09", name: "Камера 09", latitude: 42.240, longitude: 69.555, status: "warning" },
  { id: "cam-10", name: "Камера 10", latitude: 42.190, longitude: 69.540, status: "stable" },
];
