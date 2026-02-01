import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { colors } from "@/constants/colors";
//import { mockUser } from "@/mocks/data";
import { Download, Share2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { WebView } from "react-native-webview";
import {
  getResumePreviewPayload,
} from "./lib/resumePreviewStore";

export default function ResumePreviewScreen() {
  const router = useRouter();
  const payload = getResumePreviewPayload();

  //const html = payload?.html ?? "";
  const resume = payload?.resumeJson;


  const handleDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!resume) return Alert.alert("Nothing to download", "No resume HTML found.");

    try {
      
      
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing not available on this device.");
        return;
      }

    } catch (e: any) {
      Alert.alert("Export failed", e?.message ?? "Unknown error");
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!resume) return Alert.alert("Nothing to share", "No resume HTML found.");

    try {
      

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing not available on this device.");
        return;
      }

    } catch (e: any) {
      Alert.alert("Share failed", e?.message ?? "Unknown error");
    }
  };


  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Resume Preview",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      {/* HTML preview */}
      
      {/* <View style={styles.previewWrap}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={{ flex: 1, backgroundColor: colors.white }}
        />
      </View> */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resumeContainer}>
          <View style={styles.resumeHeader}>
            <Text style={styles.resumeName}>{resume?.header?.fullName}</Text>
            <Text style={styles.resumeContact}>
              {resume?.header?.email} • {resume?.header?.phone}
            </Text>
            <Text style={styles.resumeContact}>
              {resume?.header?.linkedin} • {resume?.header?.github}
            </Text>
          </View>

          <View style={styles.resumeSection}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.resumeContact}>
              {resume?.summary}
            </Text>
          </View>

          <View style={styles.resumeSection}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            <View style={styles.sectionContent}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {resume?.education?.[0]?.school || "Middle Tennessee State University"}
                </Text>
                <Text style={styles.entryDate}>{resume?.education?.[0]?.date || ""}</Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {resume?.education?.[0]?.degree} in {resume?.education?.[0]?.major}
              </Text>
              <Text style={styles.entryDetail}>
                GPA: {resume?.education?.[0]?.gpa} • Dean's List (4 semesters)
              </Text>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            <View style={styles.sectionContent}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{resume?.experience?.[0]?.title}</Text>
                <Text style={styles.entryDate}>{resume?.experience?.[0]?.date}</Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {resume?.experience?.[0]?.companyLine}
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • {resume?.experience?.[0]?.bullets?.[0] ||
                    "• Developed and maintained mobile applications using React Native"}
                </Text>
                <Text style={styles.bulletItem}>
                  • {resume?.experience?.[0]?.bullets?.[1] ||
                    "• Collaborated with cross-functional teams to define, design, and ship new features"}
                </Text>
                <Text style={styles.bulletItem}>
                  • {resume?.experience?.[0]?.bullets?.[2] ||
                    "• Optimized applications for maximum speed and scalability"}
                </Text>
              </View>
            </View>

            <View style={[styles.sectionContent, { marginTop: 16 }]}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{resume?.experience?.[1]?.title}</Text>
                <Text style={styles.entryDate}>{resume?.experience?.[1]?.date}</Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {resume?.experience?.[1]?.companyLine}
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  {resume?.experience?.[1]?.bullets?.[0] ||
                    "• Assisted 100+ students in Data Structures and Algorithms coursework"}
                </Text>
                <Text style={styles.bulletItem}>
                  {resume?.experience?.[1]?.bullets?.[1] ||
                    "• Conducted weekly office hours and graded programming assignments"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            <View style={styles.sectionContent}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{resume?.projects?.[0]?.title}</Text>
                <Text style={styles.entryDate}>{resume?.projects?.[0]?.date}</Text>
              </View>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  {resume?.projects?.[0]?.bullets?.[0] ||
                    "Built a React Native app with real-time campus navigation using Google Maps API"}
                </Text>
                <Text style={styles.bulletItem}>
                  {resume?.projects?.[0]?.bullets?.[1] ||
                    "Implemented accessibility features for users with mobility challenges"}  
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.skillsText}>
                <Text style={styles.skillCategory}>Languages: </Text>
                Python, JavaScript, TypeScript, Java, SQL
              </Text>
              <Text style={styles.skillsText}>
                <Text style={styles.skillCategory}>Frameworks: </Text>
                React, React Native, Node.js, Express, Django
              </Text>
              <Text style={styles.skillsText}>
                <Text style={styles.skillCategory}>Tools: </Text>
                Git, Docker, AWS, Firebase, PostgreSQL
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Pressable style={styles.actionButton} onPress={handleShare}>
          <Share2 size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </Pressable>
        <Pressable style={styles.downloadButton} onPress={handleDownload}>
          <Download size={20} color={colors.white} />
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewWrap: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resumeContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  resumeHeader: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
    marginBottom: 20,
  },
  resumeName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  resumeContact: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resumeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: colors.text,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    paddingBottom: 4,
    marginBottom: 12,
  },
  sectionContent: {},
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: colors.text,
    flex: 1,
  },
  entryDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  entrySubtitle: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  entryDetail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bulletList: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 16,
  },
  skillsText: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 18,
  },
  skillCategory: {
    fontWeight: "600" as const,
  },
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    paddingBottom: 36,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  downloadButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
});
