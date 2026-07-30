import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import type { DownloadSlot as DownloadSlotType } from "@/contexts/DownloadContext";

interface Props {
  slot: DownloadSlotType;
  index: number;
  onUrlChange: (url: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onClear: () => void;
  isPremium: boolean;
}

export function DownloadSlotComponent({ slot, index, onUrlChange, onStart, onCancel, onClear, isPremium }: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isLocked = index >= 3 && !isPremium;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      onUrlChange(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const statusColor =
    slot.status === "completed"
      ? colors.success
      : slot.status === "error" || slot.status === "cancelled"
      ? colors.destructive
      : slot.status === "downloading" || slot.status === "validating"
      ? colors.primary
      : colors.mutedForeground;

  const StatusIcon = () => {
    if (slot.status === "validating" || slot.status === "processing") {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }
    if (slot.status === "downloading") {
      return <MaterialCommunityIcons name="download" size={16} color={colors.primary} />;
    }
    if (slot.status === "completed") {
      return <Feather name="check-circle" size={16} color={colors.success} />;
    }
    if (slot.status === "error") {
      return <Feather name="alert-circle" size={16} color={colors.destructive} />;
    }
    if (slot.status === "cancelled") {
      return <Feather name="slash" size={16} color={colors.destructive} />;
    }
    return null;
  };

  const platformColors: Record<string, string> = {
    YouTube: "#FF0000",
    TikTok: "#00F2EA",
    Instagram: "#E1306C",
    Facebook: "#1877F2",
    Twitter: "#1DA1F2",
    Twitch: "#9146FF",
    Vimeo: "#1AB7EA",
    Dailymotion: "#00B0E0",
    SoundCloud: "#FF5500",
    Spotify: "#1DB954",
  };

  const platformColor = slot.platform ? (platformColors[slot.platform] ?? colors.primary) : colors.primary;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: isLocked
              ? colors.border
              : slot.status === "downloading"
              ? colors.primary + "40"
              : slot.status === "completed"
              ? colors.success + "30"
              : colors.border,
            borderWidth: 1,
            opacity: isLocked ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.slotNumber, { backgroundColor: isLocked ? colors.muted : colors.primary + "20" }]}>
            {isLocked ? (
              <Feather name="lock" size={12} color={colors.mutedForeground} />
            ) : (
              <Text style={[styles.slotNumberText, { color: colors.primary }]}>{index + 1}</Text>
            )}
          </View>

          {slot.platform ? (
            <View style={[styles.platformBadge, { backgroundColor: platformColor + "20" }]}>
              <Text style={[styles.platformText, { color: platformColor }]}>{slot.platform}</Text>
            </View>
          ) : null}

          <View style={styles.flex} />

          <StatusIcon />

          {(slot.status === "downloading" || slot.status === "validating") && (
            <Pressable onPress={onCancel} style={[styles.iconBtn, { marginLeft: 8 }]}>
              <Feather name="x" size={14} color={colors.destructive} />
            </Pressable>
          )}

          {(slot.status === "completed" || slot.status === "cancelled" || slot.status === "error") && (
            <Pressable onPress={onClear} style={[styles.iconBtn, { marginLeft: 8 }]}>
              <Feather name="trash-2" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {isLocked ? (
          <View style={styles.lockedRow}>
            <Feather name="star" size={14} color={colors.gold} />
            <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
              Premium requis pour ce slot
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <Feather name="link" size={14} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Coller un lien YouTube, TikTok, Instagram..."
                placeholderTextColor={colors.mutedForeground}
                value={slot.url}
                onChangeText={onUrlChange}
                editable={slot.status === "idle" || slot.status === "cancelled" || slot.status === "completed" || slot.status === "error"}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              <Pressable onPress={handlePaste} style={styles.pasteBtn} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Feather name="clipboard" size={14} color={colors.primary} />
              </Pressable>
            </View>

            {slot.status === "downloading" && (
              <View style={styles.progressArea}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${slot.progress}%` as any,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressText, { color: colors.primary }]}>
                    {Math.round(slot.progress)}%
                  </Text>
                  <Text style={[styles.speedText, { color: colors.mutedForeground }]}>
                    {slot.speed}
                  </Text>
                  <Text style={[styles.sizeText, { color: colors.mutedForeground }]}>
                    {slot.size}
                  </Text>
                </View>
              </View>
            )}

            {slot.status === "validating" && (
              <View style={styles.validatingRow}>
                <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.validatingText, { color: colors.mutedForeground }]}>
                  Extraction du lien direct...
                </Text>
              </View>
            )}

            {slot.status === "processing" && (
              <View style={styles.validatingRow}>
                <ActivityIndicator size="small" color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[styles.validatingText, { color: colors.mutedForeground }]}>
                  Enregistrement dans la galerie...
                </Text>
              </View>
            )}

            {slot.status === "completed" && (
              <View style={styles.completedRow}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.completedText, { color: colors.success }]} numberOfLines={1}>
                    {slot.title || "Téléchargement terminé"}
                  </Text>
                  <Text style={[styles.savedText, { color: colors.mutedForeground }]}>
                    ✓ Sauvegardé dans la galerie · {slot.size}
                  </Text>
                </View>
              </View>
            )}

            {(slot.status === "error" || slot.status === "cancelled") && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {slot.status === "cancelled" ? "Téléchargement annulé" : slot.error ?? "Erreur inconnue"}
              </Text>
            )}

            {(slot.status === "idle" || slot.status === "error" || slot.status === "cancelled") && slot.url.trim().length > 0 && (
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onStart}
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
              >
                <MaterialCommunityIcons name="download" size={16} color={colors.primaryForeground} />
                <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                  Télécharger
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  slotNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  slotNumberText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  platformText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  flex: { flex: 1 },
  iconBtn: {
    padding: 4,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  lockedText: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 8,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  pasteBtn: { padding: 4 },
  progressArea: { marginTop: 4 },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: "row",
    gap: 12,
  },
  progressText: { fontSize: 12, fontWeight: "600" as const },
  speedText: { fontSize: 12 },
  sizeText: { fontSize: 12 },
  validatingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  validatingText: { fontSize: 13, flex: 1 },
  completedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingVertical: 4,
  },
  completedText: { fontSize: 13, fontWeight: "500" as const },
  savedText: { fontSize: 11, marginTop: 2 },
  errorText: { fontSize: 13, marginTop: 4 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  startBtnText: { fontSize: 14, fontWeight: "600" as const },
});
