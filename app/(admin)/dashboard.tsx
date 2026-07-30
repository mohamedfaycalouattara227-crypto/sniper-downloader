import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { User } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  totalDownloads: number;
}

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, premiumUsers: 0, freeUsers: 0, totalDownloads: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const usersRaw = await AsyncStorage.getItem("vdl_users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const historyRaw = await AsyncStorage.getItem("vdl_history");
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    setStats({
      totalUsers: users.length,
      premiumUsers: users.filter((u) => u.isPremium).length,
      freeUsers: users.filter((u) => !u.isPremium).length,
      totalDownloads: history.length,
    });

    setRecentUsers(users.slice(-5).reverse());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const statCards = [
    { label: "Utilisateurs", value: stats.totalUsers, icon: "users" as const, color: colors.primary },
    { label: "Premium", value: stats.premiumUsers, icon: "star" as const, color: colors.gold },
    { label: "Gratuits", value: stats.freeUsers, icon: "user" as const, color: colors.success },
    { label: "Téléchargements", value: stats.totalDownloads, icon: "download" as const, color: colors.adminAccent },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 34 : 32 },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.adminAccent + "15", borderColor: colors.adminAccent }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.adminAccent + "30" }]}>
          <Feather name="shield" size={28} color={colors.adminAccent} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Panneau Admin</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Sniper Downloader</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vue d'ensemble</Text>

      <View style={styles.statsGrid}>
        {statCards.map((card, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: card.color + "20" }]}>
              <Feather name={card.icon} size={20} color={card.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{card.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(admin)/users")}
        >
          <Feather name="users" size={18} color={colors.primaryForeground} />
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>
            Gérer les utilisateurs
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Utilisateurs récents</Text>

      <View style={[styles.userList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {recentUsers.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun utilisateur</Text>
        ) : (
          recentUsers.map((u, i) => (
            <View key={u.id} style={[styles.userRow, { borderBottomColor: colors.border, borderBottomWidth: i < recentUsers.length - 1 ? 1 : 0 }]}>
              <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.userAvatarText, { color: colors.primary }]}>
                  {u.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{u.name}</Text>
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{u.email}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {u.isPremium && (
                  <View style={[styles.miniTag, { backgroundColor: colors.gold + "20" }]}>
                    <Text style={[styles.miniTagText, { color: colors.gold }]}>PRO</Text>
                  </View>
                )}
                {u.isAdmin && (
                  <View style={[styles.miniTag, { backgroundColor: colors.adminAccent + "20" }]}>
                    <Text style={[styles.miniTagText, { color: colors.adminAccent }]}>ADMIN</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.devFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.devText, { color: colors.mutedForeground }]}>
          Développé par Mohamed Fayçal Ouattara
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    gap: 8,
    alignItems: "center",
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionsRow: { gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  userList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  userAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  userDetails: { flex: 1 },
  userName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  userEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniTagText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  emptyText: { padding: 20, textAlign: "center", fontFamily: "Inter_400Regular" },
  devFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  devText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
