import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export type DownloadStatus =
  | "idle"
  | "validating"
  | "downloading"
  | "processing"
  | "completed"
  | "error"
  | "cancelled";

export interface DownloadSlot {
  id: string;
  url: string;
  title: string;
  type: "video" | "audio" | "unknown";
  status: DownloadStatus;
  progress: number;
  speed: string;
  size: string;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  thumbnail: string | null;
  platform: string;
  localUri: string | null;
}

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  type: "video" | "audio" | "unknown";
  platform: string;
  completedAt: string;
  size: string;
  thumbnail: string | null;
  localUri: string | null;
}

type NotifyFn = (title: string, platform: string) => Promise<void>;
type NotifyStartFn = (count: number) => Promise<void>;

interface DownloadContextType {
  slots: DownloadSlot[];
  history: DownloadHistoryItem[];
  updateSlotUrl: (slotId: string, url: string) => void;
  startDownload: (slotId: string, notifyComplete?: NotifyFn) => Promise<void>;
  cancelDownload: (slotId: string) => void;
  clearSlot: (slotId: string) => void;
  startAllDownloads: (notifyComplete?: NotifyFn, notifyStart?: NotifyStartFn) => Promise<void>;
  clearHistory: () => Promise<void>;
  totalActive: number;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

const HISTORY_KEY = "sniper_history_v2";
const NUM_SLOTS = 10;

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const PLATFORMS: Record<string, string> = {
  youtube: "YouTube",
  youtu: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  twitch: "Twitch",
  vimeo: "Vimeo",
  dailymotion: "Dailymotion",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
};

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  for (const key of Object.keys(PLATFORMS)) {
    if (lower.includes(key)) return PLATFORMS[key] ?? "Web";
  }
  return "Web";
}

function detectType(url: string): "video" | "audio" | "unknown" {
  const lower = url.toLowerCase();
  if (lower.includes("soundcloud") || lower.includes("spotify") || lower.includes("music") || lower.endsWith(".mp3") || lower.endsWith(".m4a") || lower.endsWith(".ogg")) return "audio";
  if (lower.includes("youtube") || lower.includes("tiktok") || lower.includes("instagram") || lower.includes("vimeo") || lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) return "video";
  return "unknown";
}

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const getApiBase = (): string => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "http://localhost:80/api";
};

const createEmptySlot = (index: number): DownloadSlot => ({
  id: `slot-${index}`,
  url: "",
  title: "",
  type: "unknown",
  status: "idle",
  progress: 0,
  speed: "",
  size: "",
  error: null,
  startedAt: null,
  completedAt: null,
  thumbnail: null,
  platform: "",
  localUri: null,
});

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<DownloadSlot[]>(
    Array.from({ length: NUM_SLOTS }, (_, i) => createEmptySlot(i))
  );
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const downloadResumables = useRef<Map<string, FileSystem.DownloadResumable>>(new Map());
  const cancelFlags = useRef<Set<string>>(new Set());
  const lastBytesRef = useRef<Map<string, { bytes: number; time: number }>>(new Map());

  useEffect(() => {
    loadHistory();
    if (Platform.OS !== "web") {
      import("expo-media-library").then((ML) => ML.requestPermissionsAsync()).catch(() => {});
    }
  }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  };

  const saveHistory = async (items: DownloadHistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {}
  };

  const downloadForWeb = async (
    slotId: string,
    directUrl: string,
    title: string,
    ext: string,
    sizeDisplay: string,
    originalUrl: string,
    type: "video" | "audio" | "unknown",
    platform: string,
    thumbnail: string | null,
    notifyComplete?: NotifyFn
  ) => {
    try {
      const resp = await fetch(directUrl);
      if (!resp.ok) throw new Error("Erreur lors du téléchargement.");
      const contentLength = Number(resp.headers.get("content-length") ?? 0);
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("Impossible de lire le flux.");

      const chunks: Uint8Array[] = [];
      let received = 0;
      const lastWeb = { bytes: 0, time: Date.now() };

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelFlags.current.has(slotId)) break;
        chunks.push(value);
        received += value.length;

        const now = Date.now();
        const dt = (now - lastWeb.time) / 1000;
        let speed = "";
        if (dt > 0.5) {
          speed = formatSize((received - lastWeb.bytes) / dt) + "/s";
          lastWeb.bytes = received;
          lastWeb.time = now;
        }
        const progress = contentLength > 0 ? Math.min((received / contentLength) * 100, 99) : 0;
        const sz = contentLength > 0 ? formatSize(contentLength) : sizeDisplay;

        setSlots((prev) =>
          prev.map((s) => s.id === slotId ? { ...s, progress, speed, size: sz } : s)
        );
      }

      if (cancelFlags.current.has(slotId)) {
        setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, status: "cancelled", speed: "" } : s));
        return;
      }

      setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, status: "processing", progress: 99 } : s));

      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      const finalSize = formatSize(blob.size) !== "—" ? formatSize(blob.size) : sizeDisplay;

      const historyItem: DownloadHistoryItem = {
        id: generateId(),
        url: originalUrl,
        title,
        type: type === "audio" ? "audio" : "video",
        platform,
        completedAt: new Date().toISOString(),
        size: finalSize,
        thumbnail,
        localUri: null,
      };

      setHistory((h) => {
        const updated = [historyItem, ...h].slice(0, 100);
        saveHistory(updated);
        return updated;
      });

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, status: "completed", progress: 100, completedAt: new Date().toISOString(), speed: "", size: finalSize }
            : s
        )
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (notifyComplete) notifyComplete(title, platform);
    } catch (err) {
      if (!cancelFlags.current.has(slotId)) {
        const msg = err instanceof Error ? err.message : "Erreur lors du téléchargement.";
        setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, status: "error", error: msg, speed: "" } : s));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const updateSlotUrl = useCallback((slotId: string, url: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, url, status: "idle", progress: 0, error: null, localUri: null } : s
      )
    );
  }, []);

  const startDownload = useCallback(async (slotId: string, notifyComplete?: NotifyFn) => {
    cancelFlags.current.delete(slotId);

    let currentSlot: DownloadSlot | undefined;
    setSlots((prev) => {
      currentSlot = prev.find((s) => s.id === slotId);
      return prev;
    });

    await new Promise((r) => setTimeout(r, 10));

    setSlots((prev) => {
      const s = prev.find((x) => x.id === slotId);
      if (!s) return prev;
      currentSlot = s;
      return prev;
    });

    const url = currentSlot?.url?.trim() ?? "";
    if (!url) return;

    const platform = detectPlatform(url);
    const type = detectType(url);

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, status: "validating", progress: 0, error: null, platform, type, startedAt: new Date().toISOString() }
          : s
      )
    );

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let extractedTitle = "Média téléchargé";
    let directUrl = "";
    let ext = "mp4";
    let sizeDisplay = "—";
    let thumbnail: string | null = null;

    try {
      const apiBase = getApiBase();
      const resp = await fetch(`${apiBase}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: type === "audio" ? "audio" : "video" }),
      });

      if (cancelFlags.current.has(slotId)) {
        setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, status: "cancelled" } : s));
        return;
      }

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Erreur serveur (${resp.status})`);
      }

      const data = await resp.json() as {
        title: string;
        ext: string;
        size: string;
        sizeBytes: number;
        downloadUrl: string;
        thumbnail: string | null;
        type: "video" | "audio";
      };

      extractedTitle = data.title;
      directUrl = data.downloadUrl;
      ext = data.ext ?? "mp4";
      sizeDisplay = data.size ?? "—";
      thumbnail = data.thumbnail;

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, status: "downloading", title: extractedTitle, thumbnail, size: sizeDisplay }
            : s
        )
      );
    } catch (err) {
      if (!cancelFlags.current.has(slotId)) {
        const msg = err instanceof Error ? err.message : "Erreur lors de l'extraction du lien.";
        setSlots((prev) =>
          prev.map((s) => s.id === slotId ? { ...s, status: "error", error: msg } : s)
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (!directUrl) {
      setSlots((prev) =>
        prev.map((s) => s.id === slotId ? { ...s, status: "error", error: "Lien de téléchargement introuvable." } : s)
      );
      return;
    }

    if (Platform.OS === "web") {
      await downloadForWeb(slotId, directUrl, extractedTitle, ext, sizeDisplay, url, type, platform, thumbnail, notifyComplete);
      return;
    }

    const fileName = `sniper_${generateId()}.${ext}`;
    const cacheDir = FileSystem.cacheDirectory ?? "file:///tmp/";
    const fileUri = cacheDir + fileName;

    lastBytesRef.current.set(slotId, { bytes: 0, time: Date.now() });

    const downloadResumable = FileSystem.createDownloadResumable(
      directUrl,
      fileUri,
      {},
      (downloadProgress) => {
        if (cancelFlags.current.has(slotId)) return;
        const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
        const progress = totalBytesExpectedToWrite > 0
          ? Math.min((totalBytesWritten / totalBytesExpectedToWrite) * 100, 99)
          : 0;

        const now = Date.now();
        const prev = lastBytesRef.current.get(slotId);
        let speed = "";
        if (prev) {
          const dt = (now - prev.time) / 1000;
          const db = totalBytesWritten - prev.bytes;
          if (dt > 0.5 && db > 0) speed = formatSize(db / dt) + "/s";
        }
        lastBytesRef.current.set(slotId, { bytes: totalBytesWritten, time: now });

        if (totalBytesExpectedToWrite > 0 && sizeDisplay === "—") {
          sizeDisplay = formatSize(totalBytesExpectedToWrite);
        }

        setSlots((prev2) =>
          prev2.map((s) => s.id === slotId ? { ...s, progress, speed, size: sizeDisplay } : s)
        );
      }
    );

    downloadResumables.current.set(slotId, downloadResumable);

    try {
      const result = await downloadResumable.downloadAsync();

      if (cancelFlags.current.has(slotId)) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        return;
      }

      downloadResumables.current.delete(slotId);
      lastBytesRef.current.delete(slotId);

      if (!result?.uri) throw new Error("Téléchargement incomplet.");

      setSlots((prev) =>
        prev.map((s) => s.id === slotId ? { ...s, status: "processing", progress: 99 } : s)
      );

      let savedUri = result.uri;

      try {
        const ML = await import("expo-media-library");
        const { status } = await ML.getPermissionsAsync();
        if (status === "granted") {
          const asset = await ML.createAssetAsync(result.uri);
          savedUri = asset.uri;
          let album = await ML.getAlbumAsync("Sniper Downloader");
          if (!album) {
            await ML.createAlbumAsync("Sniper Downloader", asset, false);
          } else {
            await ML.addAssetsToAlbumAsync([asset], album, false);
          }
        }
      } catch {
        // galerie non disponible, on garde le fichier cache
      }

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const finalSize = fileInfo.exists && "size" in fileInfo && fileInfo.size ? formatSize(fileInfo.size) : sizeDisplay;

      const historyItem: DownloadHistoryItem = {
        id: generateId(),
        url,
        title: extractedTitle,
        type: type === "audio" ? "audio" : "video",
        platform,
        completedAt: new Date().toISOString(),
        size: finalSize,
        thumbnail,
        localUri: savedUri,
      };

      setHistory((h) => {
        const updated = [historyItem, ...h].slice(0, 100);
        saveHistory(updated);
        return updated;
      });

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, status: "completed", progress: 100, completedAt: new Date().toISOString(), speed: "", size: finalSize, localUri: savedUri }
            : s
        )
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (notifyComplete) notifyComplete(extractedTitle, platform);

    } catch (err) {
      downloadResumables.current.delete(slotId);
      lastBytesRef.current.delete(slotId);
      FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});

      if (!cancelFlags.current.has(slotId)) {
        const msg = err instanceof Error ? err.message : "Erreur lors du téléchargement.";
        setSlots((prev) =>
          prev.map((s) => s.id === slotId ? { ...s, status: "error", error: msg, speed: "" } : s)
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, []);

  const cancelDownload = useCallback((slotId: string) => {
    cancelFlags.current.add(slotId);
    const resumable = downloadResumables.current.get(slotId);
    if (resumable) {
      resumable.pauseAsync().catch(() => {});
      downloadResumables.current.delete(slotId);
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: "cancelled", speed: "" } : s))
    );
  }, []);

  const clearSlot = useCallback((slotId: string) => {
    cancelFlags.current.add(slotId);
    const resumable = downloadResumables.current.get(slotId);
    if (resumable) {
      resumable.pauseAsync().catch(() => {});
      downloadResumables.current.delete(slotId);
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? createEmptySlot(parseInt(s.id.split("-")[1] ?? "0")) : s))
    );
    setTimeout(() => cancelFlags.current.delete(slotId), 500);
  }, []);

  const startAllDownloads = useCallback(
    async (notifyComplete?: NotifyFn, notifyStart?: NotifyStartFn) => {
      const slotsWithUrl = slots.filter((s) => s.url.trim() && s.status === "idle");
      if (notifyStart && slotsWithUrl.length > 0) notifyStart(slotsWithUrl.length);
      for (const slot of slotsWithUrl) {
        startDownload(slot.id, notifyComplete);
        await new Promise((r) => setTimeout(r, 400));
      }
    },
    [slots, startDownload]
  );

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  const totalActive = slots.filter(
    (s) => s.status === "downloading" || s.status === "validating" || s.status === "processing"
  ).length;

  return (
    <DownloadContext.Provider
      value={{ slots, history, updateSlotUrl, startDownload, cancelDownload, clearSlot, startAllDownloads, clearHistory, totalActive }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownload() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownload must be used within DownloadProvider");
  return ctx;
}
