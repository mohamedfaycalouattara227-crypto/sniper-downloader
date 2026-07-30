import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDownload, type DownloadHistoryItem } from "@/contexts/DownloadContext";
import { useColors } from "@/hooks/useColors";

const PLATFORM_COLORS: Record<string, string> = {
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

function HistoryCard({ item }: { item: DownloadHistoryItem }) {
  const colors = useColors();
  const platformColor = PLATFORM_COLORS[item.platform] ?? colors.primary;
  const date = new Date(item.completedAt);
  const formatted = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.typeIcon, { backgroundColor: platformColor + "20" }]}>
        <Feather
          name={item.type === "audio" ? "music" : "video"}
          size={18}
          color={platformColor}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title || "Contenu téléchargé"}
        </Text>
        <View style={styles.cardMeta}>
          {item.platform ? (
            <View style={[styles.platformChip, { backgroundColor: platformColor + "20" }]}>
              <Text style={[styles.platformChipText, { color: platformColor }]}>{item.platform}</Text>
            </View>
          ) : null}
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.size}</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{formatted}</Text>
      </View>
      <Feather name="check-circle" size={18} color={colors.success} />
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useDownload();
  const [filter, setFilter] = useState<"all" | "video" | "audio">("all");

  const filtered = history.filter((h) => filter === "all" || h.type === filter);

  const handleClear = () => {
    Alert.alert(
      "Effacer l'historique",
      "Supprimer tous les téléchargements de l'historique ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Effacer",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Historique</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear} style={[styles.clearBtn, { backgroundColor: colors.destructive + "20" }]}>
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </Pressable>
        )}
      </View>

      <View style={[styles.filters, { borderBottomColor: colors.border }]}>
        {(["all", "video", "audio"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f ? colors.primary : colors.card,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {f === "all" ? "Tout" : f === "video" ? "Vidéos" : "Audio"}
            </Text>
          </Pressable>
        ))}
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {filtered.length} fichier{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun téléchargement</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Vos téléchargements terminés apparaîtront ici
            </Text>
          </View>
        }
      />
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
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  clearBtn: { padding: 8, borderRadius: 8 },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: "auto" },
  list: { padding: 16, gap: 0 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  platformChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  platformChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
