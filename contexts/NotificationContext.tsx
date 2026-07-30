import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  sendDownloadComplete: (title: string, platform: string) => Promise<void>;
  sendDownloadStart: (count: number) => Promise<void>;
  inAppNotifications: InAppNotif[];
  dismissNotif: (id: string) => void;
}

export interface InAppNotif {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "error" | "warning";
  createdAt: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 6);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotif[]>([]);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    checkPermission();
    notifListener.current = Notifications.addNotificationReceivedListener(() => {});
    return () => {
      notifListener.current?.remove();
    };
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === "web") return;
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === "granted");
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    if (!Device.isDevice) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === "granted";
    setPermissionGranted(granted);
    return granted;
  };

  const pushInApp = (title: string, message: string, type: InAppNotif["type"]) => {
    const notif: InAppNotif = { id: genId(), title, message, type, createdAt: Date.now() };
    setInAppNotifications((prev) => [notif, ...prev].slice(0, 20));
    setTimeout(() => {
      setInAppNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 5000);
  };

  const sendDownloadComplete = async (title: string, platform: string) => {
    pushInApp(
      "Téléchargement terminé ✓",
      `${title || "Contenu"} de ${platform || "inconnu"} téléchargé avec succès`,
      "success"
    );
    if (Platform.OS !== "web" && permissionGranted) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Téléchargement terminé",
          body: `${title || "Votre fichier"} (${platform}) a été téléchargé`,
          sound: true,
        },
        trigger: null,
      });
    }
  };

  const sendDownloadStart = async (count: number) => {
    pushInApp(
      "Téléchargements lancés",
      `${count} téléchargement${count > 1 ? "s" : ""} démarré${count > 1 ? "s" : ""} simultanément`,
      "info"
    );
    if (Platform.OS !== "web" && permissionGranted) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⬇️ Téléchargements en cours",
          body: `${count} fichier${count > 1 ? "s" : ""} en cours de téléchargement`,
          sound: false,
        },
        trigger: null,
      });
    }
  };

  const dismissNotif = (id: string) => {
    setInAppNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ permissionGranted, requestPermission, sendDownloadComplete, sendDownloadStart, inAppNotifications, dismissNotif }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
