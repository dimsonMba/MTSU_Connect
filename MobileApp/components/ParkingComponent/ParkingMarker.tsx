import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Car } from "lucide-react-native";
import { ParkingLot, PERMIT_COLORS } from "@/constants/parkingData";
import Colors from "@/constants/colors";

interface ParkingMarkerProps {
  lot: ParkingLot;
  onPress: (lot: ParkingLot) => void;
}

export default function ParkingMarker({ lot, onPress }: ParkingMarkerProps) {
  const markerColor = PERMIT_COLORS[lot.permitType];
  const isWhite = lot.permitType === "facultyStaff";

  return (
    <Marker
      coordinate={{ latitude: lot.latitude, longitude: lot.longitude }}
      onPress={() => onPress(lot)}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <View
          style={[
            styles.marker,
            { backgroundColor: markerColor },
            isWhite && styles.markerBorder,
          ]}
        >
          <Car
            size={16}
            color={isWhite ? Colors.textPrimary : Colors.white}
            strokeWidth={2.5}
          />
        </View>
        <View style={[styles.markerTail, { borderTopColor: markerColor }]} />
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>{lot.available}</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerBorder: {
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  availabilityBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Colors.trueBlue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  availabilityText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700" as const,
  },
});
