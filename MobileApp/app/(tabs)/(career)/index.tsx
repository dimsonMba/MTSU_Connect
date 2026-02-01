import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { mockUser } from "@/mocks/data";
import { ResumeData } from "@/types";
import {
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { uploadResumePdfToStorage } from "../../lib/storage";
import { extractResumeText, generateResumeJson } from "../../lib/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { setResumePreviewPayload } from "@/app/lib/resumePreviewStore";


type Step = "personal" | "education";

const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
  {
    id: "personal",
    title: "Personal Info",
    icon: <User size={20} color={colors.white} />,
  },
  {
    id: "education",
    title: "Education",
    icon: <GraduationCap size={20} color={colors.white} />,
  },
  
];

export default function CareerScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
  } | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: mockUser.name,
      email: mockUser.email,
      phone: "",
      linkedin: "",
      portfolio: "",
    },
    education: {
      school: "Middle Tennessee State University",
      degree: "Bachelor of Science",
      major: mockUser.major,
      gpa: mockUser.gpa.toString(),
      graduationDate: "May 2024",
    },
    
  });


  const pickResumePdf = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    setResumeFile({
      uri: file.uri,
      name: file.name ?? "resume.pdf",
      mimeType: file.mimeType ?? "application/pdf",
      size: file.size,
    });
  };

  const handleStepChange = (step: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(step);
  };

  const handleTailorWithAI = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!resumeFile) {
      setError("No PDF selected");
      return;
    }
    if (!jobDescription.trim()) {
      setError?.("Paste a job description");
      return;
    }

  
    try {
      // 1) upload PDF
      const resumePdfPath = await uploadResumePdfToStorage(resumeFile);

      // 2) extract text server-side
      const extractedText = await extractResumeText({
        resumePdfPath,
        jobDescription,
        formData: resumeData,
      });

      //console.log("Extracted text:", extractedText);
      console.log("Extracted text length:", extractedText.length);

      const resume = await generateResumeJson({
        resumeText: extractedText,
        formData: resumeData,
        jobDescription,
      });

      console.log("Generated HTML:", resume);

      //const { uri } = await Print.printToFileAsync({ html }); // create PDF once here

      setResumePreviewPayload({ resumeJson: resume});

      // We wtill need to do the ai implementation with supabase edge functions here

      // go to next screen
      router.push("/resume-preview");
    } catch (e: any) {
      console.error(e);
      setError?.(e.message ?? "Something went wrong");
    }
    
  };


  
  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.fullName}
                onChangeText={(text) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: text },
                  }))
                }
                placeholder="John Doe"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.email}
                onChangeText={(text) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: text },
                  }))
                }
                placeholder="john@mtmail.mtsu.edu"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.phone}
                onChangeText={(text) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: text },
                  }))
                }
                placeholder="(615) 555-0123"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LinkedIn (optional)</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.linkedin}
                onChangeText={(text) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: text },
                  }))
                }
                placeholder="linkedin.com/in/johndoe"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        );

      case "education":
        return (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School</Text>
              <TextInput
                style={styles.input}
                value={resumeData.education.school}
                onChangeText={(text) =>
                  setResumeData((prev) => ({
                    ...prev,
                    education: { ...prev.education, school: text },
                  }))
                }
                placeholder="Middle Tennessee State University"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Degree</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.education.degree}
                  onChangeText={(text) =>
                    setResumeData((prev) => ({
                      ...prev,
                      education: { ...prev.education, degree: text },
                    }))
                  }
                  placeholder="B.S."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Major</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.education.major}
                  onChangeText={(text) =>
                    setResumeData((prev) => ({
                      ...prev,
                      education: { ...prev.education, major: text },
                    }))
                  }
                  placeholder="Computer Science"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>GPA</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.education.gpa}
                  onChangeText={(text) =>
                    setResumeData((prev) => ({
                      ...prev,
                      education: { ...prev.education, gpa: text },
                    }))
                  }
                  placeholder="3.75"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Graduation Date</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.education.graduationDate}
                  onChangeText={(text) =>
                    setResumeData((prev) => ({
                      ...prev,
                      education: { ...prev.education, graduationDate: text },
                    }))
                  }
                  placeholder="May 2024"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        );
        
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <Pressable
              key={step.id}
              style={[
                styles.stepItem,
                currentStep === step.id && styles.stepItemActive,
              ]}
              onPress={() => handleStepChange(step.id)}
            >
              <View
                style={[
                  styles.stepIcon,
                  currentStep === step.id && styles.stepIconActive,
                  index < currentStepIndex && styles.stepIconCompleted,
                ]}
              >
                {step.icon}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  currentStep === step.id && styles.stepTitleActive,
                ]}
              >
                {step.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {renderStepContent()}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Upload Previous Resume (PDF)</Text>

          <Pressable style={styles.uploadButton} onPress={pickResumePdf}>
            <Text style={styles.uploadButtonText}>
              {resumeFile ? "Change PDF" : "Choose PDF"}
            </Text>
          </Pressable>

          {resumeFile && (
            <Text style={styles.fileNameText}>
              Selected: {resumeFile.name}
            </Text>
          )}
        </View>


        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={styles.aiTitle}>Tailor with AI</Text>
          </View>
          <Text style={styles.aiDescription}>
            Paste a job description and our AI will optimize your resume for the
            role.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste job description here..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
          <Pressable
            style={[
              styles.aiButton,
              !jobDescription && styles.aiButtonDisabled,
            ]}
            onPress={handleTailorWithAI}
            disabled={!jobDescription}
          >
            <Sparkles size={18} color={colors.white} />
            <Text style={styles.aiButtonText}>Optimize Resume</Text>
          </Pressable>
          {error && (
            <Text style={[styles.fileNameText, { textAlign: 'center' }]}>
              Oops: {error}
            </Text>
          )}
        </View>

        
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepItemActive: {},
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepIconActive: {
    backgroundColor: colors.primary,
  },
  stepIconCompleted: {
    backgroundColor: colors.success,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: colors.textSecondary,
    textAlign: "center",
  },
  stepTitleActive: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputRow: {
    flexDirection: "row",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  experienceCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  experienceTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  skillText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text,
  },
  addSkillContainer: {
    flexDirection: "row",
    gap: 12,
  },
  aiSection: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: colors.primary,
  },
  aiDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  aiButtonDisabled: {
    opacity: 0.5,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
    paddingVertical: 16,
    paddingLeft: 20,
    borderRadius: 14,
    gap: 8,
  },
  previewButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.white,
    flex: 1,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  fileNameText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 13,
  },

});
