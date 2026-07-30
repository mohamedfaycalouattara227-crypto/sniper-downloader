import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { InAppNotif } from "@/contexts/NotificationContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  notif: InAppNotif;
  onDismiss: () => void;
}

function Toast({ notif, onDismiss }: Props) {
  const colors = useColors();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeColors = {
    success: colors.success,
    info: colors.primary,
    error: colors.destructive,
    warning: colors.warning,
  };

  const typeIcons = {
    success: "check-circle" as const,
    info: "info" as const,
    error: "alert-circle" as const,
    warning: "alert-triangle" as const,
  };

  const color = typeColors[notif.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.card,
          borderLeftColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Feather name={typeIcons[notif.type]} size={18} color={color} />
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {notif.title}
        </Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notif.message}
        </Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.closeBtn}>
        <Feather name="x" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

interface ContainerProps {
  notifications: InAppNotif[];
  onDismiss: (id: string) => void;
}

export function InAppNotifContainer({ notifications, onDismiss }: ContainerProps) {
  const insets = useSafeAreaInsets();

  if (notifications.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      {notifications.slice(0, 3).map((n) => (
        <Toast key={n.id} notif={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textArea: { flex: 1 },
  title: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  message: { fontSize: 12, fontFamily: "Inter_400Regular" },
  closeBtn: { padding: 4 },
});
