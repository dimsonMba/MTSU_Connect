import { useState, useEffect, useRef, useCallback } from "react";
import { BUS_ROUTES, BUSES, BusRouteType } from "@/constants/busRoutes";

interface BusPosition {
  id: string;
  routeId: BusRouteType;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
}

export function useBusAnimation(visibleRoutes: string[]) {
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const routeIndices = useRef<Record<string, number>>({});
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initializeBuses = useCallback(() => {
    const initialPositions: BusPosition[] = BUSES.map((bus) => {
      const route = BUS_ROUTES.find((r) => r.id === bus.routeId);
      if (!route) return null;

      routeIndices.current[bus.id] = 0;

      return {
        id: bus.id,
        routeId: bus.routeId,
        name: bus.name,
        latitude: route.coordinates[0].latitude,
        longitude: route.coordinates[0].longitude,
        color: route.color,
      };
    }).filter(Boolean) as BusPosition[];

    setBusPositions(initialPositions);
  }, []);

  const animateBuses = useCallback(() => {
    setBusPositions((prevPositions) => {
      return prevPositions.map((bus) => {
        const route = BUS_ROUTES.find((r) => r.id === bus.routeId);
        if (!route) return bus;

        const currentIndex = routeIndices.current[bus.id] || 0;
        const nextIndex = (currentIndex + 1) % route.coordinates.length;

        routeIndices.current[bus.id] = nextIndex;

        return {
          ...bus,
          latitude: route.coordinates[nextIndex].latitude,
          longitude: route.coordinates[nextIndex].longitude,
        };
      });
    });
  }, []);

  useEffect(() => {
    initializeBuses();

    animationRef.current = setInterval(() => {
      animateBuses();
    }, 2000);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [initializeBuses, animateBuses]);

  const filteredBusPositions = busPositions.filter((bus) =>
    visibleRoutes.includes(bus.routeId),
  );

  return filteredBusPositions;
}
