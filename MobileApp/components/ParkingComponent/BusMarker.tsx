import React from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Bus } from "lucide-react-native";
import Colors from "@/constants/colors";

interface BusMarkerProps {
  coordinate: { latitude: number; longitude: number };
  color: string;
  name: string;
}

export default function BusMarker({ coordinate, color, name }: BusMarkerProps) {
  return (
    <Marker coordinate={coordinate} title={name} tracksViewChanges={false}>
      <View style={styles.container}>
        <View style={[styles.marker, { backgroundColor: color }]}>
          <Bus size={18} color={Colors.white} strokeWidth={2.5} />
        </View>
        <View style={styles.pulse} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  pulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.3)",
    zIndex: 1,
  },
});
