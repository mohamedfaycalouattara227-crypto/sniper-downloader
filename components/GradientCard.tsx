import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "premium" | "admin";
}

export function GradientCard({ children, style, variant = "default" }: GradientCardProps) {
  const colors = useColors();

  const borderColor =
    variant === "premium"
      ? colors.premium
      : variant === "admin"
      ? colors.adminAccent
      : colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor,
          borderWidth: variant !== "default" ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    overflow: "hidden",
  },
});
