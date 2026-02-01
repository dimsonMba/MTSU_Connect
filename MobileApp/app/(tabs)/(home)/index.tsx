import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { BentoCard } from "@/components/BentoCard";
import {
  mockUser,
  mockNextClass,
  mockStudyPartners,
  mockChatRooms,
} from "@/mocks/data";
import {
  MapPin,
  Bus,
  Car,
  MessageCircle,
  Upload,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Quick action:", action);
    if (action === "chat") {
      router.push("/chat/1");
    } else if (action === "upload") {
      router.push("/(tabs)/(study)");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{mockUser.name.split(" ")[0]}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {mockUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
        </View>

        <BentoCard size="large" backgroundColor={colors.primary}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeTop}>
              <View>
                <Text style={styles.welcomeLabel}>Current GPA</Text>
                <Text style={styles.gpaValue}>{mockUser.gpa.toFixed(2)}</Text>
              </View>
              <View style={styles.gpaTrend}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={styles.gpaTrendText}>+0.12</Text>
              </View>
            </View>
            <View style={styles.welcomeBottom}>
              <Text style={styles.majorText}>{mockUser.major}</Text>
              <Text style={styles.semesterText}>Spring 2024 • Senior</Text>
            </View>
          </View>
        </BentoCard>

        <View style={styles.gridRow}>
          <View style={styles.gridHalf}>
            <BentoCard
              size="small"
              subtitle="Next Class"
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
            >
              <View style={styles.smallCardContent}>
                <View style={styles.iconBadge}>
                  <MapPin size={18} color={colors.primary} />
                </View>
                <Text style={styles.smallCardTitle}>
                  {mockNextClass.location}
                </Text>
                <View style={styles.timeRow}>
                  <Clock size={12} color={colors.textSecondary} />
                  <Text style={styles.smallCardMeta}>{mockNextClass.time}</Text>
                </View>
              </View>
            </BentoCard>
          </View>
          <View style={styles.gridHalf}>
            <BentoCard
              size="small"
              subtitle="Permit Type"
              onPress={() => router.push("/(tabs)/(parking)")}
            >
              <View style={styles.smallCardContent}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${colors.permitBlue}15` },
                  ]}
                >
                  <Car size={18} color={colors.permitBlue} />
                </View>
                <Text style={styles.smallCardTitle}>Blue Permit</Text>
                <Text style={styles.smallCardMeta}>Valid until May</Text>
              </View>
            </BentoCard>
          </View>
        </View>

        <BentoCard
          size="wide"
          subtitle="Campus Transit"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={styles.busCard}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: `${colors.success}15` },
              ]}
            >
              <Bus size={20} color={colors.success} />
            </View>
            <View style={styles.busInfo}>
              <Text style={styles.busTitle}>Raider Xpress</Text>
              <Text style={styles.busSubtitle}>
                Route A • Greenland Dr Stop
              </Text>
            </View>
            <View style={styles.etaContainer}>
              <Text style={styles.etaValue}>3</Text>
              <Text style={styles.etaLabel}>min</Text>
            </View>
          </View>
        </BentoCard>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleQuickAction("chat")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <MessageCircle size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Start Chat</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleQuickAction("upload")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.success}10` },
              ]}
            >
              <Upload size={22} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Upload PDF</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Match</Text>
          <View style={styles.aiBadge}>
            <Sparkles size={12} color={colors.primary} />
            <Text style={styles.aiBadgeText}>AI Powered</Text>
          </View>
        </View>
        <BentoCard size="medium">
          <Text style={styles.matchSubtitle}>Suggested Study Partners</Text>
          {mockStudyPartners.slice(0, 2).map((partner, index) => (
            <View
              key={partner.id}
              style={[styles.partnerRow, index > 0 && styles.partnerRowBorder]}
            >
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerInitial}>{partner.name[0]}</Text>
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerMeta}>
                  {partner.sharedClasses} shared classes
                </Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchScore}>{partner.matchScore}%</Text>
              </View>
            </View>
          ))}
        </BentoCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Study Rooms</Text>
          <Pressable style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        </View>
        {mockChatRooms
          .filter((r) => r.isStudyRoom)
          .slice(0, 2)
          .map((room) => (
            <Pressable
              key={room.id}
              onPress={() => router.push(`/chat/${room.id}`)}
            >
              <BentoCard size="wide">
                <View style={styles.roomCard}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: `${colors.primary}10` },
                    ]}
                  >
                    <Users size={18} color={colors.primary} />
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomMeta}>
                      {room.participants} participants
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </View>
              </BentoCard>
            </Pressable>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
  welcomeCard: {
    flex: 1,
  },
  welcomeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: colors.white,
    letterSpacing: -2,
  },
  gpaTrend: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  gpaTrendText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.success,
  },
  welcomeBottom: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 16,
  },
  majorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.white,
    marginBottom: 2,
  },
  semesterText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  gridHalf: {
    flex: 1,
  },
  smallCardContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  smallCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  smallCardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  busCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  busInfo: {
    flex: 1,
    marginLeft: 14,
  },
  busTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  busSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  etaContainer: {
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  etaValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.white,
    lineHeight: 28,
  },
  etaLabel: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.9,
    marginTop: -2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  matchSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  partnerRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  partnerInitial: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  partnerMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchBadge: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: colors.success,
  },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomInfo: {
    flex: 1,
    marginLeft: 14,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  roomMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
