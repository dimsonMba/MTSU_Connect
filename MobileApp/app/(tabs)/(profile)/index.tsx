import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { studentService } from "@/services/student.service";
import PermitSelector from "@/components/PermitSelector";
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
import { useTheme } from "@/contexts/ThemeContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, colors: themeColors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [userEmail, setUserEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState("");
  const [authFullName, setAuthFullName] = React.useState("");
  const [showPermitModal, setShowPermitModal] = React.useState(false);
  const [selectedPermit, setSelectedPermit] = React.useState<
    "green" | "red" | "blue" | null
  >(null);

  React.useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
        setAuthFullName(user.user_metadata?.full_name || "");
        const { profile, error } = await profileService.getProfile(user.id);
        
        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { profile: newProfile } = await profileService.createProfile(user.id, {
            full_name: user.user_metadata?.full_name || null,
            email: user.email || "",
          });
          if (newProfile) {
            setUserProfile(newProfile);
          }
        } else if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Edit Name",
      "Enter your full name",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async (fullName) => {
            if (fullName && userId) {
              try {
                const { profile, error } = await profileService.updateProfile(userId, {
                  full_name: fullName,
                });
                if (error) {
                  console.error("Profile update error:", error);
                  Alert.alert("Error", error.message || "Failed to update profile");
                } else {
                  setUserProfile(profile);
                  Alert.alert("Success", "Profile updated successfully!");
                }
              } catch (err: any) {
                console.error("Exception updating profile:", err);
                Alert.alert("Error", err.message || "An unexpected error occurred");
              }
            }
          },
        },
      ],
      "plain-text",
      userProfile?.full_name || ""
    );
  };

  const handleEditMajor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Edit Major",
      "Enter your major",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async (major) => {
            if (major && userId) {
              try {
                const { profile, error } = await profileService.updateProfile(userId, {
                  major: major,
                });
                if (error) {
                  console.error("Major update error:", error);
                  Alert.alert("Error", error.message || "Failed to update major");
                } else {
                  setUserProfile(profile);
                  Alert.alert("Success", "Major updated successfully!");
                }
              } catch (err: any) {
                console.error("Exception updating major:", err);
                Alert.alert("Error", err.message || "An unexpected error occurred");
              }
            }
          },
        },
      ],
      "plain-text",
      userProfile?.major || ""
    );
  };

  const handleEditGPA = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Edit GPA",
      "Enter your GPA (0.00 - 4.00)",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async (gpaString) => {
            const gpa = parseFloat(gpaString || "0");
            if (gpaString && userId && gpa >= 0 && gpa <= 4.0) {
              try {
                const { profile, error } = await profileService.updateProfile(userId, {
                  gpa: gpa,
                });
                if (error) {
                  console.error("GPA update error:", error);
                  Alert.alert("Error", error.message || "Failed to update GPA");
                } else {
                  setUserProfile(profile);
                  Alert.alert("Success", "GPA updated successfully!");
                }
              } catch (err: any) {
                console.error("Exception updating GPA:", err);
                Alert.alert("Error", err.message || "An unexpected error occurred");
              }
            } else {
              Alert.alert("Invalid GPA", "Please enter a GPA between 0.00 and 4.00");
            }
          },
        },
      ],
      "plain-text",
      userProfile?.gpa?.toString() || ""
    );
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Update presence to offline before logging out
            await studentService.updatePresence(false);
            
            // Sign out from Supabase
            const { error } = await authService.signOut();
            if (error) {
              Alert.alert("Error", error.message || "Failed to log out");
              return;
            }
            
            // Navigate back to landing page
            router.replace("/");
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to log out");
          }
        },
      },
    ]);
  };

  const handleEditCredits = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Edit Credits",
      "Enter your total credits",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (creditsString) => {
            const credits = parseInt(creditsString || "", 10);
            if (!Number.isNaN(credits) && userId) {
              try {
                const { profile, error } = await profileService.updateProfile(userId, {
                  credits: credits,
                });
                if (error) {
                  console.error("Credits update error:", error);
                  Alert.alert("Error", error.message || "Failed to update credits");
                } else {
                  setUserProfile(profile);
                  Alert.alert("Success", "Credits updated successfully!");
                }
              } catch (err: any) {
                console.error("Exception updating credits:", err);
                Alert.alert("Error", err.message || "An unexpected error occurred");
              }
            } else {
              Alert.alert("Invalid Credits", "Please enter a valid number");
            }
          },
        },
      ],
      "plain-text",
      userProfile?.credits?.toString() || ""
    );
  };

  const handleEditFlashcards = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Edit Flashcard Sets",
      "Enter your total flashcard sets",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (setsString) => {
            const sets = parseInt(setsString || "", 10);
            if (!Number.isNaN(sets) && userId) {
              try {
                const { profile, error } = await profileService.updateProfile(userId, {
                  flashcard_sets: sets,
                });
                if (error) {
                  console.error("Flashcards update error:", error);
                  Alert.alert("Error", error.message || "Failed to update flashcards");
                } else {
                  setUserProfile(profile);
                  Alert.alert("Success", "Flashcards updated successfully!");
                }
              } catch (err: any) {
                console.error("Exception updating flashcards:", err);
                Alert.alert("Error", err.message || "An unexpected error occurred");
              }
            } else {
              Alert.alert("Invalid Number", "Please enter a valid number");
            }
          },
        },
      ],
      "plain-text",
      userProfile?.flashcard_sets?.toString() || ""
    );
  };

  const handleEditPermit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPermit(userProfile?.permit_type || null);
    setShowPermitModal(true);
  };

  const handleSavePermit = async () => {
    if (!userId) return;
    try {
      const { profile, error } = await profileService.updateProfile(userId, {
        permit_type: selectedPermit,
      });
      if (error) {
        console.error("Permit update error:", error);
        Alert.alert("Error", error.message || "Failed to update permit");
      } else {
        setUserProfile(profile);
        setShowPermitModal(false);
        Alert.alert("Success", "Permit updated successfully!");
      }
    } catch (err: any) {
      console.error("Exception updating permit:", err);
      Alert.alert("Error", err.message || "An unexpected error occurred");
    }
  };

  const permitColor = userProfile?.permit_type
    ? userProfile.permit_type === "green"
      ? colors.permitGreen
      : userProfile.permit_type === "red"
        ? colors.permitRed
        : colors.permitBlue
    : colors.textMuted;

  const displayName =
    userProfile?.full_name ||
    authFullName ||
    userEmail.split("@")[0] ||
    "Student";
  const displayEmail = userEmail || "";
  const displayMajor = userProfile?.major || "Undeclared";
  const displayGPA = userProfile?.gpa;
  const displayCredits = userProfile?.credits ?? null;
  const displayFlashcards = userProfile?.flashcard_sets ?? null;
  const displayPermit = userProfile?.permit_type
    ? `${userProfile.permit_type.charAt(0).toUpperCase()}${userProfile.permit_type.slice(1)} Permit`
    : "Set Permit";

  // Use theme colors
  const bgColor = themeColors.background;
  const cardBgColor = themeColors.cardBackground;
  const textColor = themeColors.text;
  const textSecondaryColor = themeColors.textSecondary;
  const textMutedColor = themeColors.textMuted;
  const borderColor = themeColors.border;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {displayName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <Text style={[styles.userName, { color: textColor }]}>{displayName}</Text>
        <Text style={[styles.userEmail, { color: textSecondaryColor }]}>{displayEmail}</Text>
        <View style={styles.badgesRow}>
          <Pressable
            style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}
            onPress={handleEditMajor}
          >
            <GraduationCap size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {displayMajor}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.badge, { backgroundColor: `${permitColor}15` }]}
            onPress={handleEditPermit}
          >
            <Car size={14} color={permitColor} />
            <Text style={[styles.badgeText, { color: permitColor }]}>
              {displayPermit}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: cardBgColor }]}>
        <Pressable style={styles.statItem} onPress={handleEditGPA}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {displayGPA !== null && displayGPA !== undefined
              ? displayGPA.toFixed(2)
              : "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: textSecondaryColor }]}>GPA</Text>
        </Pressable>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <Pressable style={styles.statItem} onPress={handleEditCredits}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {displayCredits !== null && displayCredits !== undefined
              ? displayCredits
              : "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: textSecondaryColor }]}>Credits</Text>
        </Pressable>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <Pressable style={styles.statItem} onPress={handleEditFlashcards}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {displayFlashcards !== null && displayFlashcards !== undefined
              ? displayFlashcards
              : "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: textSecondaryColor }]}>Flashcard Sets</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textSecondaryColor }]}>Account</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBgColor }]}>
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <User size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Edit Profile</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.success}10` },
              ]}
            >
              <Mail size={18} color={colors.success} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Email Preferences</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.warning}10` },
              ]}
            >
              <Car size={18} color={colors.warning} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Update Permit</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textSecondaryColor }]}>Preferences</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBgColor }]}>
          <View style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <Bell size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: borderColor, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
          <View style={styles.menuItem}>
            <View
              style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#444444' : `${colors.text}10` }]}
            >
              <Moon size={18} color={isDarkMode ? '#FFD700' : colors.text} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: borderColor, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textSecondaryColor }]}>Support</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBgColor }]}>
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.primary}10` },
              ]}
            >
              <MessageCircle size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Contact Support</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.success}10` },
              ]}
            >
              <HelpCircle size={18} color={colors.success} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Help Center</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
          <Pressable style={styles.menuItem}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${colors.textSecondary}10` },
              ]}
            >
              <Shield size={18} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuText, { color: textColor }]}>Privacy Policy</Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <Text style={[styles.versionText, { color: textMutedColor }]}>MTSU Connect Plus v1.0.0</Text>

      <Modal
        visible={showPermitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPermitModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPermitModal(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#2A2A2A' : colors.background }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Permit</Text>
            <PermitSelector
              selected={selectedPermit}
              onSelect={setSelectedPermit}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancel, { backgroundColor: cardBgColor, borderColor: borderColor }]}
                onPress={() => setShowPermitModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: textColor }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSave}
                onPress={handleSavePermit}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  modalSave: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
});
