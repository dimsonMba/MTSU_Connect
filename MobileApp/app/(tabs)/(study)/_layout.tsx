import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function StudyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        // Make the title a bit larger and centered.
        headerTitleStyle: { fontWeight: "600" as const, fontSize: 20 },
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Study Hub",
          // Disable large title to avoid extra top spacing on iOS which can
          // push content down and overlap elements like the search bar.
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="chats"
        options={{
          headerShown: false,
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
