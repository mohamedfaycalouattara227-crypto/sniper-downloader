import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const FEATURES_FREE = [
  "3 téléchargements simultanés",
  "YouTube, TikTok, Instagram",
  "Historique des 100 derniers fichiers",
  "Téléchargements vidéo HD",
];

const FEATURES_PREMIUM = [
  "10 téléchargements simultanés",
  "Toutes les plateformes supportées",
  "Historique illimité",
  "Téléchargements 4K Ultra HD",
  "Audio haute qualité (320 kbps)",
  "File de téléchargement prioritaire",
  "Support premium dédié",
  "Mise à jour automatique",
];

const WHATSAPP_NUMBER = "0022605721813";

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const isPremium = user?.isPremium ?? false;

  const handleContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msg = encodeURIComponent(
      `Bonjour Mohamed Fayçal Ouattara, je souhaite souscrire à Sniper Downloader Premium (1000f/mois).\n\nMon compte: ${user?.email ?? ""}\nNom: ${user?.name ?? ""}`
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${msg}`);
    }
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Premium</Text>
        {isPremium && (
          <View style={[styles.activeBadge, { backgroundColor: colors.gold + "20" }]}>
            <Feather name="star" size={12} color={colors.gold} />
            <Text style={[styles.activeBadgeText, { color: colors.gold }]}>ACTIF</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isPremium ? (
          <View style={[styles.premiumActiveCard, { backgroundColor: colors.card, borderColor: colors.gold }]}>
            <View style={[styles.premiumIconCircle, { backgroundColor: colors.gold + "20" }]}>
              <Feather name="star" size={36} color={colors.gold} />
            </View>
            <Text style={[styles.premiumActiveTitle, { color: colors.gold }]}>Vous êtes Premium !</Text>
            <Text style={[styles.premiumActiveSubtitle, { color: colors.mutedForeground }]}>
              Profitez de tous les avantages exclusifs
            </Text>
          </View>
        ) : (
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.premium }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: colors.premium + "20" }]}>
              <Feather name="zap" size={36} color={colors.premium} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Passez à Premium</Text>
            <Text style={[styles.heroPrice, { color: colors.premium }]}>1 000 FCFA</Text>
            <Text style={[styles.heroPeriod, { color: colors.mutedForeground }]}>/ mois</Text>
          </View>
        )}

        <View style={styles.comparison}>
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.planTitle, { color: colors.mutedForeground }]}>Gratuit</Text>
            {FEATURES_FREE.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Feather name="check" size={14} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.planCard, { backgroundColor: colors.premium + "10", borderColor: colors.premium }]}>
            <View style={styles.planTitleRow}>
              <Feather name="star" size={14} color={colors.gold} />
              <Text style={[styles.planTitle, { color: colors.premium }]}>Premium</Text>
            </View>
            {FEATURES_PREMIUM.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Feather name="check-circle" size={14} color={colors.gold} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {!isPremium && (
          <>
            <View style={[styles.howToCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.howToTitle, { color: colors.foreground }]}>Comment souscrire ?</Text>
              {[
                "Cliquez sur le bouton WhatsApp ci-dessous",
                "Envoyez votre demande d'abonnement",
                "Effectuez le paiement de 1000 FCFA/mois",
                "Votre compte sera activé sous 24h",
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNum, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.stepNumText, { color: colors.primary }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.whatsappBtn, { backgroundColor: "#25D366" }]}
              onPress={handleContact}
            >
              <Feather name="message-circle" size={22} color="#fff" />
              <View>
                <Text style={styles.whatsappBtnTitle}>Souscrire via WhatsApp</Text>
                <Text style={styles.whatsappBtnSub}>+226 05 72 18 13</Text>
              </View>
            </Pressable>
          </>
        )}

        <View style={[styles.devFooter, { borderTopColor: colors.border }]}>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 16 },
  heroCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  heroPrice: { fontSize: 36, fontFamily: "Inter_700Bold" },
  heroPeriod: { fontSize: 14, fontFamily: "Inter_400Regular" },
  premiumActiveCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  premiumIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  premiumActiveTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  premiumActiveSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  comparison: { gap: 12 },
  planCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  planTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  howToCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  howToTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  stepText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
  },
  whatsappBtnTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  whatsappBtnSub: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    opacity: 0.9,
  },
  devFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  devText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
