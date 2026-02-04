import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from "react-native";
import {
  ChevronDown,
  ChevronUp,
  Navigation,
  Car,
  Clock,
  X,
} from "lucide-react-native";
import {
  ParkingLot,
  PERMIT_LABELS,
  PERMIT_COLORS,
} from "@/constants/parkingData";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

interface ParkingBottomSheetProps {
  lots: ParkingLot[];
  selectedLot: ParkingLot | null;
  onSelectLot: (lot: ParkingLot) => void;
  onNavigate: (lot: ParkingLot) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.55;

export default function ParkingBottomSheet({
  lots,
  selectedLot,
  onSelectLot,
  onNavigate,
  isExpanded,
  onToggleExpand,
}: ParkingBottomSheetProps) {
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(animatedHeight, {
      toValue: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      useNativeDriver: false,
      friction: 10,
      tension: 50,
    }).start();
  }, [isExpanded]);

  const handleLotPress = (lot: ParkingLot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectLot(lot);
  };

  const openInMaps = (lot: ParkingLot) => {
    const url = Platform.select({
      ios: `maps:?daddr=${lot.latitude},${lot.longitude}&dirflg=d`,
      android: `geo:${lot.latitude},${lot.longitude}?q=${lot.latitude},${lot.longitude}(${lot.name})`,
      default: `https://maps.google.com/?q=${lot.latitude},${lot.longitude}`,
    });

    Linking.openURL(url);
  };

  return (
    <Animated.View style={[styles.container, { height: animatedHeight }]}>
      <TouchableOpacity
        style={styles.handle}
        onPress={onToggleExpand}
        activeOpacity={0.8}
      >
        <View style={styles.handleBar} />
        <View style={styles.handleContent}>
          <Text style={styles.handleTitle}>Parking Lots</Text>
          {isExpanded ? (
            <ChevronDown size={20} color={Colors.textSecondary} />
          ) : (
            <ChevronUp size={20} color={Colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {selectedLot && (
        <View style={styles.selectedLotCard}>
          <View style={styles.selectedLotHeader}>
            <View style={styles.selectedLotInfo}>
              <View
                style={[
                  styles.permitBadge,
                  { backgroundColor: PERMIT_COLORS[selectedLot.permitType] },
                  selectedLot.permitType === "facultyStaff" &&
                    styles.permitBadgeBorder,
                ]}
              >
                <Text
                  style={[
                    styles.permitBadgeText,
                    selectedLot.permitType === "facultyStaff" &&
                      styles.permitBadgeTextDark,
                  ]}
                >
                  {PERMIT_LABELS[selectedLot.permitType]}
                </Text>
              </View>
              <Text style={styles.selectedLotName}>{selectedLot.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeSelectedButton}
              onPress={() => onSelectLot(null as any)}
            >
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.selectedLotStats}>
            <View style={styles.statItem}>
              <Car size={16} color={Colors.trueBlue} />
              <Text style={styles.statText}>
                <Text style={styles.statHighlight}>
                  {selectedLot.available}
                </Text>
                /{selectedLot.spaces} spaces
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={16} color={Colors.permits.student} />
              <Text style={styles.statText}>Open 24/7</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => openInMaps(selectedLot)}
            activeOpacity={0.8}
          >
            <Navigation size={18} color={Colors.white} />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.lotsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lotsListContent}
      >
        {lots.map((lot) => {
          const isSelected = selectedLot?.id === lot.id;
          const isWhite = lot.permitType === "facultyStaff";

          return (
            <TouchableOpacity
              key={lot.id}
              style={[styles.lotItem, isSelected && styles.lotItemSelected]}
              onPress={() => handleLotPress(lot)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.lotColorIndicator,
                  { backgroundColor: PERMIT_COLORS[lot.permitType] },
                  isWhite && styles.lotColorIndicatorBorder,
                ]}
              />
              <View style={styles.lotInfo}>
                <Text style={styles.lotName}>{lot.name}</Text>
                <Text style={styles.lotDescription} numberOfLines={1}>
                  {lot.description}
                </Text>
              </View>
              <View style={styles.lotAvailability}>
                <Text
                  style={[
                    styles.availableCount,
                    lot.available < 20 && styles.availableCountLow,
                  ]}
                >
                  {lot.available}
                </Text>
                <Text style={styles.availableLabel}>spots</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  handleContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  handleTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  selectedLotCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedLotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  selectedLotInfo: {
    flex: 1,
  },
  closeSelectedButton: {
    padding: 4,
  },
  permitBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  permitBadgeBorder: {
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
  },
  permitBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  permitBadgeTextDark: {
    color: Colors.textPrimary,
  },
  selectedLotName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  selectedLotStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statHighlight: {
    fontWeight: "700" as const,
    color: Colors.trueBlue,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.trueBlue,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  lotsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  lotsListContent: {
    paddingBottom: 40,
  },
  lotItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lotItemSelected: {
    borderColor: Colors.trueBlue,
    backgroundColor: "#F0F7FF",
  },
  lotColorIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  lotColorIndicatorBorder: {
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  lotInfo: {
    flex: 1,
  },
  lotName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  lotDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lotAvailability: {
    alignItems: "center",
    marginLeft: 8,
  },
  availableCount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.permits.student,
  },
  availableCountLow: {
    color: Colors.busRoutes.red,
  },
  availableLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: "uppercase" as const,
  },
});
