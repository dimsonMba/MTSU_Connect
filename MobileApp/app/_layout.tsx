import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@/constants/colors";
import { studentService } from "@/services/student.service";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600" as const },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[chatId]"
        options={{
          title: "Chat",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="flashcards/[documentId]"
        options={{
          title: "Flashcards",
          presentation: "card",
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="resume-preview"
        options={{
          title: "Resume Preview",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setPresence = async (isOnline: boolean) => {
      if (!isMounted) return;
      await studentService.updatePresence(isOnline);
    };

    setPresence(true);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setPresence(true);
      } else {
        setPresence(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
      setPresence(false);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
