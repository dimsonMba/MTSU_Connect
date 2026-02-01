export type BusRouteType = "red" | "blue" | "green";

export interface BusRoute {
  id: BusRouteType;
  name: string;
  color: string;
  coordinates: { latitude: number; longitude: number }[];
}

export interface Bus {
  id: string;
  routeId: BusRouteType;
  name: string;
}

export const BUS_ROUTES: BusRoute[] = [
  {
    id: "red",
    name: "Red Route",
    color: "#EF4444",
    coordinates: [
      { latitude: 35.852, longitude: -86.365 },
      { latitude: 35.851, longitude: -86.366 },
      { latitude: 35.85, longitude: -86.3675 },
      { latitude: 35.849, longitude: -86.369 },
      { latitude: 35.848, longitude: -86.37 },
      { latitude: 35.847, longitude: -86.371 },
      { latitude: 35.846, longitude: -86.37 },
      { latitude: 35.8455, longitude: -86.368 },
      { latitude: 35.8465, longitude: -86.3665 },
      { latitude: 35.848, longitude: -86.3655 },
      { latitude: 35.85, longitude: -86.3645 },
      { latitude: 35.852, longitude: -86.365 },
    ],
  },
  {
    id: "blue",
    name: "Blue Route",
    color: "#3B82F6",
    coordinates: [
      { latitude: 35.8485, longitude: -86.3665 },
      { latitude: 35.849, longitude: -86.368 },
      { latitude: 35.8495, longitude: -86.37 },
      { latitude: 35.849, longitude: -86.372 },
      { latitude: 35.8475, longitude: -86.373 },
      { latitude: 35.846, longitude: -86.372 },
      { latitude: 35.8455, longitude: -86.37 },
      { latitude: 35.846, longitude: -86.368 },
      { latitude: 35.847, longitude: -86.367 },
      { latitude: 35.8485, longitude: -86.3665 },
    ],
  },
  {
    id: "green",
    name: "Green Route",
    color: "#22C55E",
    coordinates: [
      { latitude: 35.851, longitude: -86.371 },
      { latitude: 35.852, longitude: -86.37 },
      { latitude: 35.853, longitude: -86.3685 },
      { latitude: 35.8535, longitude: -86.367 },
      { latitude: 35.8525, longitude: -86.3655 },
      { latitude: 35.851, longitude: -86.365 },
      { latitude: 35.8495, longitude: -86.366 },
      { latitude: 35.849, longitude: -86.368 },
      { latitude: 35.8495, longitude: -86.37 },
      { latitude: 35.851, longitude: -86.371 },
    ],
  },
];

export const BUSES: Bus[] = [
  { id: "bus-red-1", routeId: "red", name: "Raider 1" },
  { id: "bus-blue-1", routeId: "blue", name: "Raider 2" },
  { id: "bus-green-1", routeId: "green", name: "Raider 3" },
];
