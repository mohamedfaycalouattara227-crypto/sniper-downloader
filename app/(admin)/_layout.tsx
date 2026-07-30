import { Feather } from "@expo/vector-icons";
import { Redirect, Stack, router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) return null;
  if (!user?.isAdmin) return <Redirect href="/(main)/download" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Inter_700Bold", color: colors.adminAccent },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 8, padding: 4 }}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="users" options={{ title: "Gestion Utilisateurs" }} />
    </Stack>
  );
}
