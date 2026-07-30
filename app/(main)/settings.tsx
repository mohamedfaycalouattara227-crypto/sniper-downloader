import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotifications } from "@/contexts/NotificationContext";
import { useStorage, type StorageLocation } from "@/contexts/StorageContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentLocation, storageOptions, setLocation, freeSpace } = useStorage();
  const { permissionGranted, requestPermission } = useNotifications();
  const [notifLoading, setNotifLoading] = useState(false);
  const [downloadNotif, setDownloadNotif] = useState(true);
  const [startNotif, setStartNotif] = useState(false);
  const [changingStorage, setChangingStorage] = useState(false);

  const handleSelectStorage = async (loc: StorageLocation) => {
    setChangingStorage(true);
    await setLocation(loc);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChangingStorage(false);
  };

  const handleToggleNotif = async (value: boolean) => {
    if (value && !permissionGranted) {
      setNotifLoading(true);
      const granted = await requestPermission();
      setNotifLoading(false);
      if (!granted) {
        Alert.alert(
          "Permissions refusées",
          "Activez les notifications pour Sniper Downloader dans les paramètres de votre téléphone.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setDownloadNotif(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const locationIcons: Record<string, "folder" | "download" | "archive"> = {
    documents: "folder",
    downloads: "download",
    cache: "archive",
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
        <Feather name="settings" size={22} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Paramètres</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>EMPLACEMENT DE STOCKAGE</Text>
          <View style={[styles.diskInfo, { backgroundColor: colors.card }]}>
            <Feather name="hard-drive" size={18} color={colors.primary} />
            <Text style={[styles.diskLabel, { color: colors.mutedForeground }]}>Espace libre</Text>
            <Text style={[styles.diskValue, { color: colors.foreground }]}>{freeSpace}</Text>
            {changingStorage && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
          </View>

          {storageOptions.map((option) => {
            const isSelected = currentLocation === option.location;
            const icon = locationIcons[option.location] ?? "folder";
            return (
              <Pressable
                key={option.location}
                onPress={() => handleSelectStorage(option.location)}
                style={[
                  styles.storageOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.storageIconWrap, { backgroundColor: isSelected ? colors.primary + "20" : colors.secondary }]}>
                  <Feather name={icon} size={20} color={isSelected ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={styles.storageInfo}>
                  <Text style={[styles.storageLabel, { color: colors.foreground }]}>{option.label}</Text>
                  <Text style={[styles.storageDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {option.description}
                  </Text>
                  <Text style={[styles.storagePath, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {option.path.length > 40 ? "..." + option.path.slice(-37) : option.path}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                >
                  {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>NOTIFICATIONS</Text>

          <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.toggleIcon, { backgroundColor: colors.success + "20" }]}>
                <Feather name="bell" size={18} color={colors.success} />
              </View>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
                  Téléchargement terminé
                </Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  Alerte quand un fichier est prêt
                </Text>
              </View>
              {notifLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={downloadNotif && permissionGranted}
                  onValueChange={handleToggleNotif}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              )}
            </View>

            <View style={styles.toggleRow}>
              <View style={[styles.toggleIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="download" size={18} color={colors.primary} />
              </View>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
                  Démarrage téléchargement
                </Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  Alerte lors du lancement
                </Text>
              </View>
              <Switch
                value={startNotif && permissionGranted}
                onValueChange={async (v) => {
                  if (v && !permissionGranted) {
                    const ok = await requestPermission();
                    if (!ok) return;
                  }
                  setStartNotif(v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {!permissionGranted && (
            <View style={[styles.permWarning, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.permWarningText, { color: colors.foreground }]}>
                Les notifications système sont désactivées. Activez-les dans les paramètres de votre téléphone.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>À PROPOS</Text>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Version", value: "1.0.0" },
              { label: "Développeur", value: "Mohamed Fayçal Ouattara" },
              { label: "Contact", value: "+226 05 72 18 13" },
              { label: "Plateforme", value: Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web" },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[styles.aboutRow, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}
              >
                <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.aboutValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>
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
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 0 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  diskInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  diskLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  diskValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  storageOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  storageIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  storageInfo: { flex: 1 },
  storageLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  storageDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  storagePath: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, opacity: 0.6 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 11, height: 11, borderRadius: 6 },
  menuSection: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 0,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  permWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  permWarningText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  aboutCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  aboutLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  aboutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
