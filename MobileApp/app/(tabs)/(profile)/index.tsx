import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { mockUser } from "@/mocks/data";
import {
  User,
  Mail,
  GraduationCap,
  Car,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  MessageCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  const getPermitColor = () => {
    switch (mockUser.permitType) {
      case "green":
        return colors.permitGreen;
      case "red":
        return colors.permitRed;
      case "blue":
        return colors.permitBlue;
      default:
        return colors.textMuted;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {mockUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <Text style={styles.userName}>{mockUser.name}</Text>
        <Text style={styles.userEmail}>{mockUser.email}</Text>
        <View style={styles.badgesRow}>
          <View
            style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}
          >
            <GraduationCap size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {mockUser.major}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: `${getPermitColor()}15` }]}
          >
            <Car size={14} color={getPermitColor()} />
            <Text style={[styles.badgeText, { color: getPermitColor() }]}>
              {mockUser.permitType?.charAt(0).toUpperCase()}
              {mockUser.permitType?.slice(1)} Permit
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockUser.gpa.toFixed(2)}</Text>
          <Text style={styles.statLabel}>GPA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>98</Text>
          <Text style={styles.statLabel}>Credits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Flashcard Sets</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <User size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.success}10` },
              ]}
            >
              <Mail size={18} color={colors.success} />
            </View>
            <Text style={styles.menuText}>Email Preferences</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.warning}10` },
              ]}
            >
              <Car size={18} color={colors.warning} />
            </View>
            <Text style={styles.menuText}>Update Permit</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <Bell size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <View
              style={[styles.menuIcon, { backgroundColor: `${colors.text}10` }]}
            >
              <Moon size={18} color={colors.text} />
            </View>
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <MessageCircle size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Contact Support</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.success}10` },
              ]}
            >
              <HelpCircle size={18} color={colors.success} />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.textSecondary}10` },
              ]}
            >
              <Shield size={18} color={colors.textSecondary} />
            </View>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <Text style={styles.versionText}>MTSU Connect Plus v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.error}10`,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.error,
  },
  versionText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
});
