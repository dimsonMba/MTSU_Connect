import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { BentoCard } from "@/components/BentoCard";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { chatService } from "@/services/chat.service";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Bus,
  Car,
  MessageCircle,
  Upload,
  TrendingUp,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [userEmail, setUserEmail] = React.useState("");
  const [authFullName, setAuthFullName] = React.useState("");
  const [studyPartners, setStudyPartners] = React.useState<any[]>([]);
  const [studyRooms, setStudyRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [onlineCount, setOnlineCount] = React.useState(0);
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    loadUserProfile();
  }, []);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const loadUserProfile = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      if (!user) return;

      setUserEmail(user.email || "");
      setAuthFullName(user.user_metadata?.full_name || "");

      const { profile, error } = await profileService.getProfile(user.id);

      if (error && error.code === "PGRST116") {
        const { profile: newProfile } = await profileService.createProfile(user.id, {
          full_name: user.user_metadata?.full_name || null,
        });
        if (newProfile) {
          setUserProfile(newProfile);
        }
      } else if (profile) {
        setUserProfile(profile);
      }

      const [{ profiles }, { data: rooms }, { count }] = await Promise.all([
        profileService.getAllProfiles(),
        chatService.getAllStudyGroups(),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_online", true),
      ]);

      const partners = (profiles || [])
        .filter((p) => p.id !== user.id)
        .slice(0, 2);
      setStudyPartners(partners);
      setStudyRooms((rooms || []).slice(0, 2));
      setOnlineCount(count || 0);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Quick action:", action);
    if (action === "chat") {
      // Navigate to the list of conversations (Inbox)
      router.push("/(tabs)/(study)/chats");
    } else if (action === "upload") {
      router.push("/(tabs)/(study)");
    }
  };

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName =
    userProfile?.full_name ||
    authFullName ||
    userEmail.split("@")[0] ||
    "Student";
  const displayGPA = userProfile?.gpa;
  const displayMajor = userProfile?.major || "Undeclared";
  const displayYear = userProfile?.year || "No class year set";
  const firstName = displayName.split(" ")[0] || displayName;
  const displayPermit = userProfile?.permit_type
    ? `${userProfile.permit_type.charAt(0).toUpperCase()}${userProfile.permit_type.slice(1)} Permit`
    : "Set Permit";
  const permitColor = userProfile?.permit_type
    ? userProfile.permit_type === "green"
      ? colors.permitGreen
      : userProfile.permit_type === "red"
        ? colors.permitRed
        : colors.permitBlue
    : colors.textMuted;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: themeColors.text }]}>{firstName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {displayName
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
                <Text style={styles.gpaValue}>
                  {displayGPA !== null && displayGPA !== undefined
                    ? displayGPA.toFixed(2)
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.gpaTrend}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={styles.gpaTrendText}>+0.12</Text>
              </View>
            </View>
            <View style={styles.welcomeBottom}>
              <Text style={styles.majorText}>{displayMajor}</Text>
              <Text style={styles.semesterText}>{displayYear}</Text>
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
                <Text style={styles.smallCardTitle}>No upcoming classes</Text>
                <Text style={styles.smallCardMeta}>Add your class schedule</Text>
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
                    { backgroundColor: `${permitColor}15` },
                  ]}
                >
                  <Car size={18} color={permitColor} />
                </View>
                <Text style={styles.smallCardTitle}>{displayPermit}</Text>
                <Text style={styles.smallCardMeta}>Tap to update in Profile</Text>
              </View>
            </BentoCard>
          </View>
        </View>

        <BentoCard
          className="mt-9"
          size="wide"
          subtitle="Campus Transit"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View className="mt-9" style={styles.busCard}>
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
          <View style={styles.busMetaRow}>
            <Text style={styles.busMetaText}>{onlineCount} online now</Text>
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
          {studyPartners.length === 0 ? (
            <Text style={styles.emptyText}>No study partners yet</Text>
          ) : (
            studyPartners.map((partner, index) => (
              <View
                key={partner.id}
                style={[styles.partnerRow, index > 0 && styles.partnerRowBorder]}
              >
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitial}>
                    {(partner.full_name || "S")[0]}
                  </Text>
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>
                    {partner.full_name || "Student"}
                  </Text>
                  <Text style={styles.partnerMeta}>
                    {partner.major || "Undeclared"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </BentoCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Study Rooms</Text>
          <Pressable style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        </View>
        {studyRooms.length === 0 ? (
          <Text style={styles.emptyText}>No study rooms yet</Text>
        ) : (
          studyRooms.map((room) => (
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
                      {room.participant_count} participants
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </View>
              </BentoCard>
            </Pressable>
          ))
        )}
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
    gap: 12, //FIXING THE CARD SPACING ????
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
  busMetaRow: {
    marginTop: 10,
  },
  busMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  busChatButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  busChatText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
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
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 8,
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
