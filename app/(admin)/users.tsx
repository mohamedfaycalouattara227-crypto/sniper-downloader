import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { User } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

function UserCard({ user, onTogglePremium, onDelete, currentUserId }: {
  user: User;
  onTogglePremium: (id: string, current: boolean) => void;
  onDelete: (id: string, name: string) => void;
  currentUserId: string;
}) {
  const colors = useColors();
  const isSelf = user.id === currentUserId;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.email}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <View style={styles.tags}>
          {user.isAdmin && (
            <View style={[styles.tag, { backgroundColor: colors.adminAccent + "20" }]}>
              <Text style={[styles.tagText, { color: colors.adminAccent }]}>ADMIN</Text>
            </View>
          )}
          <View style={[styles.tag, { backgroundColor: user.isPremium ? colors.gold + "20" : colors.muted }]}>
            <Text style={[styles.tagText, { color: user.isPremium ? colors.gold : colors.mutedForeground }]}>
              {user.isPremium ? "PREMIUM" : "FREE"}
            </Text>
          </View>
        </View>
      </View>

      {!user.isAdmin && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: user.isPremium ? colors.muted : colors.gold + "20" },
            ]}
            onPress={() => onTogglePremium(user.id, user.isPremium)}
          >
            <Feather name="star" size={14} color={user.isPremium ? colors.mutedForeground : colors.gold} />
            <Text style={[styles.actionText, { color: user.isPremium ? colors.mutedForeground : colors.gold }]}>
              {user.isPremium ? "Désactiver Premium" : "Activer Premium"}
            </Text>
          </Pressable>

          {!isSelf && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.destructive + "15" }]}
              onPress={() => onDelete(user.id, user.name)}
            >
              <Feather name="trash-2" size={14} color={colors.destructive} />
              <Text style={[styles.actionText, { color: colors.destructive }]}>Supprimer</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function UsersScreen() {
  const colors = useColors();
  const { user: currentUser, activatePremium, deactivatePremium, deleteUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all");

  const loadUsers = useCallback(async () => {
    const raw = await AsyncStorage.getItem("vdl_users");
    if (raw) setUsers(JSON.parse(raw));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleTogglePremium = async (userId: string, isPremium: boolean) => {
    if (isPremium) {
      await deactivatePremium(userId);
    } else {
      await activatePremium(userId);
    }
    await loadUsers();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (userId: string, name: string) => {
    Alert.alert(
      "Supprimer l'utilisateur",
      `Supprimer définitivement le compte de ${name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteUser(userId);
            await loadUsers();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const filtered = users.filter((u) =>
    filter === "all" ? true : filter === "premium" ? u.isPremium : !u.isPremium
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.filters, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {(["all", "premium", "free"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              { backgroundColor: filter === f ? colors.primary : "transparent" },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f ? colors.primaryForeground : colors.mutedForeground }]}>
              {f === "all" ? `Tous (${users.length})` : f === "premium" ? `Premium (${users.filter((u) => u.isPremium).length})` : `Gratuits (${users.filter((u) => !u.isPremium).length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            currentUserId={currentUser?.id ?? ""}
            onTogglePremium={handleTogglePremium}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun utilisateur</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 0 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  email: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  tags: { gap: 4, alignItems: "flex-end" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 10,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
