import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Story {
  id: string;
  emoji: string;
  title: string;
  color: string;
  content: {
    heading: string;
    body: string;
    tip?: string;
  }[];
}

const STORIES: Story[] = [
  {
    id: "1",
    emoji: "▶",
    title: "YouTube",
    color: "#FF0000",
    content: [
      {
        heading: "Télécharger YouTube",
        body: "Copiez l'URL de n'importe quelle vidéo YouTube, collez-la dans un slot et appuyez sur Télécharger.",
        tip: "Supporte la qualité 4K avec le plan Premium",
      },
      {
        heading: "Playlist entière",
        body: "Copiez le lien d'une playlist YouTube pour télécharger toutes les vidéos simultanément avec vos 10 slots.",
      },
    ],
  },
  {
    id: "2",
    emoji: "♪",
    title: "TikTok",
    color: "#00F2EA",
    content: [
      {
        heading: "TikTok sans filigrane",
        body: "Sniper Downloader télécharge les vidéos TikTok en haute qualité sans le filigrane du logo TikTok.",
        tip: "Fonctionne aussi avec les Duets et Stitch",
      },
    ],
  },
  {
    id: "3",
    emoji: "📸",
    title: "Instagram",
    color: "#E1306C",
    content: [
      {
        heading: "Reels & Stories",
        body: "Téléchargez des Reels, Stories, IGTV et posts Instagram en un seul clic.",
        tip: "Les Stories disparaissent après 24h, sauvegardez-les à temps !",
      },
    ],
  },
  {
    id: "4",
    emoji: "★",
    title: "Premium",
    color: "#FFD700",
    content: [
      {
        heading: "Passez à Premium",
        body: "Débloquez les 10 slots simultanés, la qualité 4K Ultra HD et l'audio 320 kbps pour seulement 1 000 FCFA/mois.",
        tip: "Contactez-nous sur WhatsApp : +226 05 72 18 13",
      },
      {
        heading: "Avantages exclusifs",
        body: "• 10 téléchargements simultanés\n• Audio haute qualité 320 kbps\n• Téléchargements 4K Ultra HD\n• Support prioritaire 24/7",
      },
    ],
  },
  {
    id: "5",
    emoji: "⚡",
    title: "Astuces",
    color: "#7B2FBE",
    content: [
      {
        heading: "Conseils de pro",
        body: "Utilisez le bouton 'Coller' (presse-papiers) pour insérer rapidement vos liens sans avoir à les taper manuellement.",
        tip: "Appuyez sur 'Tout télécharger' pour lancer tous les slots d'un coup",
      },
      {
        heading: "Formats supportés",
        body: "Sniper Downloader détecte automatiquement si le contenu est une vidéo ou de l'audio et choisit le meilleur format disponible.",
      },
    ],
  },
  {
    id: "6",
    emoji: "🎵",
    title: "Audio",
    color: "#FF5500",
    content: [
      {
        heading: "Musique & Podcasts",
        body: "Téléchargez de la musique depuis SoundCloud, Spotify et autres plateformes audio en qualité maximale.",
        tip: "L'audio est extrait automatiquement des vidéos YouTube",
      },
    ],
  },
];

export function StoriesRow() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setPageIndex(0);
    setSeen((prev) => new Set([...prev, story.id]));
  };

  const nextPage = () => {
    if (!selectedStory) return;
    if (pageIndex < selectedStory.content.length - 1) {
      setPageIndex((p) => p + 1);
    } else {
      setSelectedStory(null);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  };

  const currentPage = selectedStory?.content[pageIndex];

  return (
    <>
      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {STORIES.map((story) => {
            const isSeen = seen.has(story.id);
            return (
              <Pressable key={story.id} onPress={() => openStory(story)} style={styles.storyItem}>
                <View
                  style={[
                    styles.storyRing,
                    {
                      borderColor: isSeen ? colors.border : story.color,
                      opacity: isSeen ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={[styles.storyCircle, { backgroundColor: story.color + "20" }]}>
                    <Text style={styles.storyEmoji}>{story.emoji}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.storyLabel,
                    { color: isSeen ? colors.mutedForeground : colors.foreground },
                  ]}
                  numberOfLines={1}
                >
                  {story.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={!!selectedStory} transparent animationType="fade" statusBarTranslucent>
        {selectedStory && currentPage && (
          <View style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={[styles.storyModal, { backgroundColor: colors.card }]}>
              <View style={styles.progressBar}>
                {selectedStory.content.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressSegment,
                      {
                        backgroundColor: i <= pageIndex ? selectedStory.color : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.storyHeader}>
                <View style={[styles.storyHeaderIcon, { backgroundColor: selectedStory.color + "20" }]}>
                  <Text style={styles.storyEmoji}>{selectedStory.emoji}</Text>
                </View>
                <Text style={[styles.storyHeaderTitle, { color: colors.foreground }]}>
                  {selectedStory.title}
                </Text>
                <Pressable onPress={() => setSelectedStory(null)} style={styles.closeBtn}>
                  <Feather name="x" size={22} color={colors.foreground} />
                </Pressable>
              </View>

              <View style={styles.storyContent}>
                <Text style={[styles.storyHeading, { color: selectedStory.color }]}>
                  {currentPage.heading}
                </Text>
                <Text style={[styles.storyBody, { color: colors.foreground }]}>
                  {currentPage.body}
                </Text>
                {currentPage.tip && (
                  <View style={[styles.tipBox, { backgroundColor: selectedStory.color + "15", borderColor: selectedStory.color }]}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color={selectedStory.color} />
                    <Text style={[styles.tipText, { color: colors.foreground }]}>
                      {currentPage.tip}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.storyNav}>
                <Pressable onPress={prevPage} style={[styles.navBtn, { backgroundColor: colors.secondary }]} disabled={pageIndex === 0}>
                  <Feather name="chevron-left" size={20} color={pageIndex === 0 ? colors.mutedForeground : colors.foreground} />
                </Pressable>
                <Text style={[styles.navCount, { color: colors.mutedForeground }]}>
                  {pageIndex + 1} / {selectedStory.content.length}
                </Text>
                <Pressable onPress={nextPage} style={[styles.navBtn, { backgroundColor: selectedStory.color }]}>
                  <Feather
                    name={pageIndex === selectedStory.content.length - 1 ? "check" : "chevron-right"}
                    size={20}
                    color="#fff"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  row: {
    paddingHorizontal: 2,
    gap: 16,
    paddingVertical: 4,
  },
  storyItem: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  storyCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  storyEmoji: { fontSize: 22 },
  storyLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    width: 64,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  storyModal: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  progressBar: {
    flexDirection: "row",
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  storyHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  storyHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: { padding: 4 },
  storyContent: { gap: 12, minHeight: 160 },
  storyHeading: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  storyBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  storyNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  navCount: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
