import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bus, Eye, EyeOff } from "lucide-react-native";
import { BUS_ROUTES } from "@/constants/busRoutes";
import Colors from "@/constants/colors";

interface BusRouteLegendProps {
  visibleRoutes: string[];
  onToggleRoute: (routeId: string) => void;
}

export default function BusRouteLegend({
  visibleRoutes,
  onToggleRoute,
}: BusRouteLegendProps) {
  return (
    // Applying margin via the style prop because NativeWind className
    // transformation may not be active in this environment. This ensures
    // consistent spacing regardless of runtime Babel transforms.
    <View style={[styles.container, { marginTop: 30 }]}>
      <View style={styles.header}>
        <Bus size={16} color={Colors.trueBlue} />
        <Text style={styles.title}>Raider Xpress</Text>
      </View>
      <View style={styles.routes}>
        {BUS_ROUTES.map((route) => {
          const isVisible = visibleRoutes.includes(route.id);
          return (
            <TouchableOpacity
              key={route.id}
              style={[styles.routeItem, !isVisible && styles.routeItemHidden]}
              onPress={() => onToggleRoute(route.id)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.routeLine, { backgroundColor: route.color }]}
              />
              <Text
                style={[styles.routeName, !isVisible && styles.routeNameHidden]}
              >
                {route.name}
              </Text>
              {isVisible ? (
                <Eye size={14} color={Colors.textSecondary} />
              ) : (
                <EyeOff size={14} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 140,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  routes: {
    gap: 6,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  routeItemHidden: {
    opacity: 0.5,
  },
  routeLine: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  routeName: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  routeNameHidden: {
    color: Colors.textMuted,
  },
});
