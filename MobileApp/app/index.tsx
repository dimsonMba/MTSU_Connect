import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import { GraduationCap, ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslate, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <GraduationCap size={56} color={colors.primary} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>MTSU Connect</Text>
          <Text style={styles.titleAccent}>Plus</Text>
          <Text style={styles.subtitle}>Your campus companion</Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <Animated.View style={{ opacity: textOpacity }}>
            {["Smart Study Tools", "Real-time Parking", "Career Builder"].map(
              (feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ),
            )}
          </Animated.View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslate }],
          },
        ]}
      >
        <Pressable style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <ChevronRight size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.footerText}>Middle Tennessee State University</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: colors.white,
    letterSpacing: -1,
  },
  titleAccent: {
    fontSize: 36,
    fontWeight: "300" as const,
    color: colors.white,
    opacity: 0.9,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    marginTop: 8,
  },
  featuresContainer: {
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.6,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  footerText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 20,
  },
});
