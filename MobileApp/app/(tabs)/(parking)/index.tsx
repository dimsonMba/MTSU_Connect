import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { colors } from "@/constants/colors";
import { PermitSelector } from "@/components/PermitSelector";
import { ParkingBottomSheet } from "@/components/ParkingBottomSheet";
import { mockParkingLots } from "@/mocks/data";
import { ParkingLot } from "@/types";
import { Car } from "lucide-react-native";
import * as Haptics from "expo-haptics";

type PermitType = "green" | "red" | "blue" | null;

const MTSU_REGION = {
  latitude: 35.8497,
  longitude: -86.3684,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function ParkingScreen() {
  const [selectedPermit, setSelectedPermit] = useState<PermitType>(null);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapsModule, setMapsModule] = useState<any>(null);
  const isExpoGo = Constants.appOwnership === "expo";

  React.useEffect(() => {
    let mounted = true;
    if (!isExpoGo) {
      // dynamic import so Expo Go doesn't attempt to load native module at bundle time
      import("react-native-maps")
        .then((m) => mounted && setMapsModule(m))
        .catch(() => {
          /* ignore import errors; placeholder will be shown */
        });
    }
    return () => {
      mounted = false;
    };
  }, [isExpoGo]);

  const handlePermitSelect = (permit: PermitType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPermit(permit);
  };

  const handleLotPress = (lot: ParkingLot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLot(lot);
  };

  const filteredLots = selectedPermit
    ? mockParkingLots.filter((lot) => lot.permitType === selectedPermit)
    : mockParkingLots;

  const getPermitColor = (permitType: string) => {
    switch (permitType) {
      case "green":
        return colors.permitGreen;
      case "red":
        return colors.permitRed;
      case "blue":
        return colors.permitBlue;
      default:
        return colors.primary;
    }
  };

  const getFullnessOpacity = (fullness: string) => {
    switch (fullness) {
      case "low":
        return 0.3;
      case "medium":
        return 0.5;
      case "high":
        return 0.7;
      default:
        return 0.4;
    }
  };

  return (
    <View style={styles.container}>
      {/* Only mount the native MapView when we're not running inside Expo Go
          and the maps module has successfully loaded. Otherwise show a
          friendly placeholder to avoid TurboModule errors. */}
      {!isExpoGo && mapsModule ? (
        <mapsModule.default
          style={styles.map}
          initialRegion={MTSU_REGION}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredLots.map((lot) => (
            <React.Fragment key={lot.id}>
              <mapsModule.Circle
                center={{ latitude: lot.latitude, longitude: lot.longitude }}
                radius={80}
                fillColor={`${getPermitColor(lot.permitType)}${Math.round(
                  getFullnessOpacity(lot.fullness) * 255,
                )
                  .toString(16)
                  .padStart(2, "0")}`}
                strokeColor={getPermitColor(lot.permitType)}
                strokeWidth={2}
              />
              <mapsModule.Marker
                coordinate={{
                  latitude: lot.latitude,
                  longitude: lot.longitude,
                }}
                onPress={() => handleLotPress(lot)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: getPermitColor(lot.permitType) },
                  ]}
                >
                  <Text style={styles.markerText}>{lot.availableSpots}</Text>
                </View>
              </mapsModule.Marker>
            </React.Fragment>
          ))}
        </mapsModule.default>
      ) : (
        <View style={[styles.map, styles.mapPlaceholder]}>
          <Text style={styles.mapPlaceholderText}>
            Maps are unavailable in Expo Go or the native maps module failed to
            load. Build a development client or prebuild the app to enable
            native maps.
          </Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Car size={24} color={colors.primary} />
            <Text style={styles.title}>Smart Parking</Text>
          </View>
        </View>
        <View style={styles.selectorContainer}>
          <PermitSelector
            selected={selectedPermit}
            onSelect={handlePermitSelect}
          />
        </View>
      </SafeAreaView>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Availability</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.success }]}
            />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.error }]}
            />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>
      </View>

      <ParkingBottomSheet
        lot={selectedLot}
        onClose={() => setSelectedLot(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  mapPlaceholderText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
  },
  selectorContainer: {
    paddingHorizontal: 20,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: colors.white,
  },
  legendContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
