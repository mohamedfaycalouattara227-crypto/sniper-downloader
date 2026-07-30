import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DownloadSlotComponent } from "@/components/DownloadSlot";
import { InAppNotifContainer } from "@/components/InAppNotifToast";
import { StoriesRow } from "@/components/StoriesRow";
import { useAuth } from "@/contexts/AuthContext";
import { useDownload } from "@/contexts/DownloadContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useColors } from "@/hooks/useColors";

export default function DownloadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { slots, updateSlotUrl, startDownload, cancelDownload, clearSlot, startAllDownloads, totalActive } =
    useDownload();
  const { sendDownloadComplete, sendDownloadStart, inAppNotifications, dismissNotif } = useNotifications();

  const isPremium = user?.isPremium ?? false;
  const isAdmin = user?.isAdmin ?? false;

  const handleStartAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startAllDownloads(sendDownloadComplete, sendDownloadStart);
  };

  const filledSlots = slots.filter((s) => s.url.trim() && s.status === "idle").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <InAppNotifContainer notifications={inAppNotifications} onDismiss={dismissNotif} />

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="download-circle" size={28} color={colors.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>SNIPER</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {totalActive > 0
                ? `${totalActive} téléchargement${totalActive > 1 ? "s" : ""} actif${totalActive > 1 ? "s" : ""}`
                : "Prêt à télécharger"}
            </Text>
          </View>
        </View>

        <View style={styles.headerBadges}>
          {isPremium && (
            <View style={[styles.badge, { backgroundColor: colors.premium + "20" }]}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.badgeText, { color: colors.gold }]}>PREMIUM</Text>
            </View>
          )}
          {isAdmin && (
            <View style={[styles.badge, { backgroundColor: colors.adminAccent + "20" }]}>
              <Feather name="shield" size={12} color={colors.adminAccent} />
              <Text style={[styles.badgeText, { color: colors.adminAccent }]}>ADMIN</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StoriesRow />

        <View style={styles.infoBar}>
          <View style={[styles.infoItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoNum, { color: colors.primary }]}>
              {isPremium || isAdmin ? "10" : "3"}
            </Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Slots actifs</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoNum, { color: colors.success }]}>{totalActive}</Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>En cours</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoNum, { color: colors.warning }]}>
              {slots.filter((s) => s.status === "completed").length}
            </Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Terminés</Text>
          </View>
        </View>

        {filledSlots > 1 && (
          <Pressable
            style={[styles.startAllBtn, { backgroundColor: colors.accent }]}
            onPress={handleStartAll}
          >
            <MaterialCommunityIcons name="download-multiple" size={20} color="#fff" />
            <Text style={styles.startAllText}>Tout télécharger ({filledSlots} liens)</Text>
          </Pressable>
        )}

        {!isPremium && !isAdmin && (
          <View style={[styles.premiumHint, { backgroundColor: colors.premium + "15", borderColor: colors.premium }]}>
            <Feather name="star" size={14} color={colors.gold} />
            <Text style={[styles.premiumHintText, { color: colors.foreground }]}>
              <Text style={{ color: colors.gold, fontFamily: "Inter_700Bold" }}>Premium</Text> — Déverrouillez 10 slots simultanés
            </Text>
          </View>
        )}

        {slots.map((slot, index) => (
          <DownloadSlotComponent
            key={slot.id}
            slot={slot}
            index={index}
            isPremium={isPremium || isAdmin}
            onUrlChange={(url) => updateSlotUrl(slot.id, url)}
            onStart={() => startDownload(slot.id, sendDownloadComplete)}
            onCancel={() => cancelDownload(slot.id)}
            onClear={() => clearSlot(slot.id)}
          />
        ))}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Développé par Mohamed Fayçal Ouattara
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerBadges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 0 },
  infoBar: { flexDirection: "row", gap: 10, marginBottom: 14 },
  infoItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  startAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  startAllText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  premiumHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  premiumHintText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
