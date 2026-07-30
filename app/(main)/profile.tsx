import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useDownload } from "@/contexts/DownloadContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { history } = useDownload();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleAdminPanel = () => {
    router.push("/(admin)/dashboard");
  };

  const avatarInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const menuItems = [
    ...(user?.isAdmin
      ? [
          {
            icon: "shield" as const,
            label: "Panneau Administrateur",
            color: colors.adminAccent,
            onPress: handleAdminPanel,
          },
        ]
      : []),
    ...(!user?.isPremium
      ? [
          {
            icon: "star" as const,
            label: "Passer à Premium",
            color: colors.gold,
            onPress: () => router.push("/(main)/premium"),
          },
        ]
      : []),
    {
      icon: "settings" as const,
      label: "Paramètres de stockage",
      color: colors.primary,
      onPress: () => router.push("/(main)/settings"),
    },
    {
      icon: "bell" as const,
      label: "Paramètres notifications",
      color: colors.success,
      onPress: () => router.push("/(main)/settings"),
    },
    {
      icon: "help-circle" as const,
      label: "FAQ & Aide",
      color: colors.accent,
      onPress: () => router.push("/(main)/faq"),
    },
    {
      icon: "message-circle" as const,
      label: "Support WhatsApp",
      color: "#25D366",
      onPress: () => Linking.openURL("https://wa.me/0022605721813"),
    },
    {
      icon: "log-out" as const,
      label: "Déconnexion",
      color: colors.destructive,
      onPress: handleLogout,
    },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profil</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "30" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{avatarInitials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
            <View style={styles.badges}>
              {user?.isPremium && (
                <View style={[styles.badge, { backgroundColor: colors.gold + "20" }]}>
                  <Feather name="star" size={10} color={colors.gold} />
                  <Text style={[styles.badgeText, { color: colors.gold }]}>PREMIUM</Text>
                </View>
              )}
              {user?.isAdmin && (
                <View style={[styles.badge, { backgroundColor: colors.adminAccent + "20" }]}>
                  <Feather name="shield" size={10} color={colors.adminAccent} />
                  <Text style={[styles.badgeText, { color: colors.adminAccent }]}>ADMIN</Text>
                </View>
              )}
              {!user?.isPremium && !user?.isAdmin && (
                <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>GRATUIT</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Téléchargements", value: history.length.toString(), icon: "download" as const, color: colors.primary },
            {
              label: "Membre depuis",
              value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—",
              icon: "calendar" as const,
              color: colors.success,
            },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Feather name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <Pressable
              key={i}
              style={[
                styles.menuItem,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuText, { color: item.icon === "log-out" ? colors.destructive : colors.foreground }]}>
                {item.label}
              </Text>
              <Feather
                name="chevron-right"
                size={18}
                color={item.icon === "log-out" ? colors.destructive : colors.mutedForeground}
              />
            </Pressable>
          ))}
        </View>

        <View style={[styles.devFooter, { borderTopColor: colors.border }]}>
          <MaterialCommunityIcons name="code-braces" size={14} color={colors.mutedForeground} />
          <Text style={[styles.devText, { color: colors.mutedForeground }]}>
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 16 },
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 18,
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badges: { flexDirection: "row", gap: 6, marginTop: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    gap: 6,
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  menuSection: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  devFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  devText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
