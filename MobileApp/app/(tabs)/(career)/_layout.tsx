import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function CareerLayout() {
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
          title: "Career Vault",
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
