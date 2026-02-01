import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function StudyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600" as const },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Study Hub",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="chats"
        options={{
          title: "Study Chats",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="students"
        options={{
          title: "All Students",
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
