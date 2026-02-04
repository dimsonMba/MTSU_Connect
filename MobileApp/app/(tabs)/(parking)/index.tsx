import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ParkingMarker from "@/components/ParkingComponent/ParkingMarker";
import BusMarker from "@/components/ParkingComponent/BusMarker";
import BusRouteLegend from "@/components/ParkingComponent/BusRouteLegend";
import ParkingBottomSheet from "@/components/ParkingComponent/ParkingBottomSheet";
import {
  PARKING_LOTS,
  MTSU_CENTER,
  ParkingLot,
  PermitType,
} from "@/constants/parkingData";
import { BUS_ROUTES } from "@/constants/busRoutes";
import { useBusAnimation } from "@/hooks/useBusAnimation";
import Colors from "@/constants/colors";

export default function ParkingScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [activeFilters, setActiveFilters] = useState<PermitType[]>([
    "student",
    "facultyStaff",
    "handicap",
    "maintenance",
  ]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [visibleBusRoutes, setVisibleBusRoutes] = useState<string[]>([
    "red",
    "blue",
    "green",
  ]);

  const busPositions = useBusAnimation(visibleBusRoutes);

  const filteredLots = PARKING_LOTS.filter((lot) =>
    activeFilters.includes(lot.permitType),
  );

  const handleToggleFilter = useCallback((filter: PermitType) => {
    setActiveFilters((prev) => {
      if (prev.includes(filter)) {
        if (prev.length === 1) return prev;
        return prev.filter((f) => f !== filter);
      }
      return [...prev, filter];
    });
  }, []);

  const handleSelectLot = useCallback((lot: ParkingLot) => {
    setSelectedLot(lot);

    if (lot && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: lot.latitude,
          longitude: lot.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, []);

  const handleNavigate = useCallback((lot: ParkingLot) => {
    console.log("Navigate to:", lot.name);
  }, []);

  const handleToggleBusRoute = useCallback((routeId: string) => {
    setVisibleBusRoutes((prev) => {
      if (prev.includes(routeId)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== routeId);
      }
      return [...prev, routeId];
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={MTSU_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: insets.top, bottom: 200, left: 0, right: 0 }}
      >
        {BUS_ROUTES.filter((route) => visibleBusRoutes.includes(route.id)).map(
          (route) => (
            <Polyline
              key={route.id}
              coordinates={route.coordinates}
              strokeColor={route.color}
              strokeWidth={4}
              lineDashPattern={[1]}
            />
          ),
        )}

        {filteredLots.map((lot) => (
          <ParkingMarker key={lot.id} lot={lot} onPress={handleSelectLot} />
        ))}

        {busPositions.map((bus) => (
          <BusMarker
            key={bus.id}
            coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
            color={bus.color}
            name={bus.name}
          />
        ))}
      </MapView>

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <BusRouteLegend
          visibleRoutes={visibleBusRoutes}
          onToggleRoute={handleToggleBusRoute}
        />
      </View>

      <ParkingBottomSheet
        lots={filteredLots}
        selectedLot={selectedLot}
        onSelectLot={handleSelectLot}
        onNavigate={handleNavigate}
        isExpanded={isBottomSheetExpanded}
        onToggleExpand={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
});
