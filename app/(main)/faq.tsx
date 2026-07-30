import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "1",
    category: "Général",
    question: "Comment télécharger une vidéo ?",
    answer: "Copiez le lien de la vidéo depuis votre navigateur ou l'application, collez-le dans un slot de téléchargement en appuyant sur l'icône presse-papiers, puis appuyez sur 'Télécharger'. C'est tout !",
  },
  {
    id: "2",
    category: "Général",
    question: "Quelles plateformes sont supportées ?",
    answer: "Sniper Downloader supporte YouTube, TikTok, Instagram (Reels, Stories, IGTV), Facebook, Twitter/X, Twitch, Vimeo, Dailymotion, SoundCloud, Spotify et bien d'autres plateformes de streaming.",
  },
  {
    id: "3",
    category: "Général",
    question: "Combien de téléchargements simultanés sont possibles ?",
    answer: "Avec le compte gratuit, vous pouvez effectuer jusqu'à 3 téléchargements simultanément. Avec le plan Premium, vous bénéficiez de 10 slots simultanés pour un téléchargement ultra-rapide.",
  },
  {
    id: "4",
    category: "Téléchargement",
    question: "Comment fonctionne le mode 'Tout télécharger' ?",
    answer: "Lorsque vous remplissez plusieurs slots de liens, le bouton 'Tout télécharger' apparaît. Il lance automatiquement tous vos téléchargements en parallèle en un seul clic.",
  },
  {
    id: "5",
    category: "Téléchargement",
    question: "Où sont stockés mes fichiers téléchargés ?",
    answer: "Vous pouvez choisir l'emplacement de stockage dans Profil → Paramètres de stockage. Par défaut, les fichiers sont sauvegardés dans le dossier Média de votre appareil.",
  },
  {
    id: "6",
    category: "Téléchargement",
    question: "Puis-je annuler un téléchargement en cours ?",
    answer: "Oui ! Appuyez sur le bouton X rouge qui apparaît à droite de chaque slot pendant un téléchargement actif pour l'annuler immédiatement.",
  },
  {
    id: "7",
    category: "Téléchargement",
    question: "Quelle qualité vidéo est disponible ?",
    answer: "Compte gratuit : HD (720p) maximum. Compte Premium : Ultra HD 4K disponible sur les plateformes qui la supportent (YouTube 4K, Vimeo 4K, etc.).",
  },
  {
    id: "8",
    category: "Premium",
    question: "Que comprend le plan Premium ?",
    answer: "Le plan Premium (1 000 FCFA/mois) inclut : 10 slots simultanés, qualité 4K Ultra HD, audio 320 kbps, historique illimité, téléchargements prioritaires et support dédié 24/7.",
  },
  {
    id: "9",
    category: "Premium",
    question: "Comment souscrire au Premium ?",
    answer: "Rendez-vous dans l'onglet Premium et cliquez sur le bouton WhatsApp vert. Envoyez votre demande à l'administrateur (Mohamed Fayçal Ouattara) au +226 05 72 18 13 et effectuez le paiement de 1 000 FCFA/mois.",
  },
  {
    id: "10",
    category: "Premium",
    question: "Quand mon compte Premium sera-t-il activé ?",
    answer: "Votre compte Premium est activé manuellement par l'administrateur sous 24 heures après réception et confirmation de votre paiement.",
  },
  {
    id: "11",
    category: "Compte",
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Contactez l'administrateur sur WhatsApp (+226 05 72 18 13) avec votre adresse email pour réinitialiser votre mot de passe.",
  },
  {
    id: "12",
    category: "Compte",
    question: "Mes données sont-elles sécurisées ?",
    answer: "Vos données sont stockées localement sur votre appareil et ne sont jamais partagées avec des tiers. Sniper Downloader respecte votre vie privée.",
  },
  {
    id: "13",
    category: "Notifications",
    question: "Comment activer les notifications ?",
    answer: "Allez dans Profil → Paramètres → Notifications et activez les permissions. Vous recevrez des alertes en temps réel quand vos téléchargements seront terminés.",
  },
  {
    id: "14",
    category: "Technique",
    question: "L'application ne fonctionne pas, que faire ?",
    answer: "1. Vérifiez votre connexion internet\n2. Assurez-vous que le lien est valide et public\n3. Réessayez dans quelques minutes\n4. Si le problème persiste, contactez le support WhatsApp.",
  },
  {
    id: "15",
    category: "Technique",
    question: "Est-ce légal de télécharger des vidéos ?",
    answer: "Le téléchargement de contenus est légal pour un usage personnel et privé dans la plupart des pays. Respectez toujours les droits d'auteur et n'utilisez pas les contenus téléchargés à des fins commerciales.",
  },
];

const CATEGORIES = ["Tous", "Général", "Téléchargement", "Premium", "Compte", "Notifications", "Technique"];

function FaqCard({ item }: { item: FaqItem }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, { toValue, useNativeDriver: false }).start();
    setExpanded(!expanded);
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: expanded ? colors.primary : colors.border }]}
      onPress={toggle}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.question, { color: colors.foreground }]}>{item.question}</Text>
        <View style={[styles.chevronWrap, { backgroundColor: expanded ? colors.primary + "20" : colors.secondary }]}>
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={expanded ? colors.primary : colors.mutedForeground} />
        </View>
      </View>
      {expanded && (
        <Text style={[styles.answer, { color: colors.mutedForeground }]}>{item.answer}</Text>
      )}
    </Pressable>
  );
}

export default function FaqScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === "Tous" || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const grouped = CATEGORIES.filter((c) => c !== "Tous").reduce<Record<string, FaqItem[]>>((acc, cat) => {
    const items = filtered.filter((f) => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

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
        <Feather name="help-circle" size={22} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>FAQ</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.filterScroll]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.catBtn,
                  { backgroundColor: activeCategory === cat ? colors.primary : colors.card },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: activeCategory === cat ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {activeCategory === "Tous"
          ? Object.entries(grouped).map(([cat, items]) => (
              <View key={cat} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{cat}</Text>
                {items.map((item) => (
                  <FaqCard key={item.id} item={item} />
                ))}
              </View>
            ))
          : filtered.map((item) => <FaqCard key={item.id} item={item} />)}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucune réponse trouvée
            </Text>
          </View>
        )}

        <View style={[styles.supportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="message-circle" size={22} color="#25D366" />
          <View style={styles.supportText}>
            <Text style={[styles.supportTitle, { color: colors.foreground }]}>
              Besoin d'aide supplémentaire ?
            </Text>
            <Text style={[styles.supportSub, { color: colors.mutedForeground }]}>
              Contactez le support WhatsApp
            </Text>
          </View>
          <Pressable
            style={[styles.supportBtn, { backgroundColor: "#25D366" }]}
            onPress={() => Linking.openURL("https://wa.me/0022605721813")}
          >
            <Text style={styles.supportBtnText}>Chat</Text>
          </Pressable>
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
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  filterScroll: { marginBottom: 4 },
  catRow: { gap: 8, paddingBottom: 4 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1, textTransform: "uppercase", marginTop: 8 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  question: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  chevronWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  answer: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  supportText: { flex: 1 },
  supportTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  supportSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  supportBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  supportBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
