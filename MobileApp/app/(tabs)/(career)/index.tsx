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
import { ResumeData, ExperienceItem } from "@/types";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

type Step = "personal" | "education" | "experience" | "skills";

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
  {
    id: "experience",
    title: "Experience",
    icon: <Briefcase size={20} color={colors.white} />,
  },
  {
    id: "skills",
    title: "Skills",
    icon: <Code size={20} color={colors.white} />,
  },
];

export default function CareerScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [jobDescription, setJobDescription] = useState("");
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
    experience: [
      {
        id: "1",
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false,
      },
    ],
    skills: ["Python", "JavaScript", "React", "SQL"],
  });

  const handleStepChange = (step: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(step);
  };

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/resume-preview");
  };

  const handleTailorWithAI = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Tailoring resume with AI for job:", jobDescription);
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof ExperienceItem,
    value: string | boolean,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
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

      case "experience":
        return (
          <View style={styles.formSection}>
            {resumeData.experience.map((exp, index) => (
              <View key={exp.id} style={styles.experienceCard}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>
                    Experience {index + 1}
                  </Text>
                  {resumeData.experience.length > 1 && (
                    <Pressable onPress={() => removeExperience(exp.id)}>
                      <Trash2 size={18} color={colors.error} />
                    </Pressable>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Company</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.company}
                    onChangeText={(text) =>
                      updateExperience(exp.id, "company", text)
                    }
                    placeholder="Tech Company Inc."
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Position</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.position}
                    onChangeText={(text) =>
                      updateExperience(exp.id, "position", text)
                    }
                    placeholder="Software Engineer Intern"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Start Date</Text>
                    <TextInput
                      style={styles.input}
                      value={exp.startDate}
                      onChangeText={(text) =>
                        updateExperience(exp.id, "startDate", text)
                      }
                      placeholder="Jun 2023"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}
                  >
                    <Text style={styles.inputLabel}>End Date</Text>
                    <TextInput
                      style={styles.input}
                      value={exp.endDate}
                      onChangeText={(text) =>
                        updateExperience(exp.id, "endDate", text)
                      }
                      placeholder="Present"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={exp.description}
                    onChangeText={(text) =>
                      updateExperience(exp.id, "description", text)
                    }
                    placeholder="Describe your responsibilities and achievements..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            ))}
            <Pressable style={styles.addButton} onPress={addExperience}>
              <Plus size={18} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Experience</Text>
            </Pressable>
          </View>
        );

      case "skills":
        return (
          <View style={styles.formSection}>
            <View style={styles.skillsContainer}>
              {resumeData.skills.map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <Pressable onPress={() => removeSkill(skill)}>
                    <Trash2 size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add a skill (e.g., TypeScript)"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={(e) => {
                  addSkill(e.nativeEvent.text);
                }}
              />
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
        </View>

        <Pressable style={styles.previewButton} onPress={handlePreview}>
          <Eye size={20} color={colors.white} />
          <Text style={styles.previewButtonText}>Preview Resume</Text>
          <ChevronRight size={20} color={colors.white} />
        </Pressable>
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
});
