import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export type StorageLocation = "documents" | "downloads" | "cache";

export interface StorageInfo {
  location: StorageLocation;
  label: string;
  path: string;
  description: string;
}

interface StorageContextType {
  currentLocation: StorageLocation;
  storageOptions: StorageInfo[];
  setLocation: (loc: StorageLocation) => Promise<void>;
  currentPath: string;
  freeSpace: string;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);
const STORAGE_KEY = "vdl_storage_location";

const getOptions = (): StorageInfo[] => {
  if (Platform.OS === "web") {
    return [
      {
        location: "downloads",
        label: "Téléchargements",
        path: "/downloads",
        description: "Dossier Téléchargements du navigateur",
      },
    ];
  }
  return [
    {
      location: "documents",
      label: "Documents de l'app",
      path: FileSystem.documentDirectory ?? "/documents/",
      description: "Stockage privé de l'application",
    },
    {
      location: "downloads",
      label: "Dossier Média",
      path: FileSystem.documentDirectory ? FileSystem.documentDirectory + "downloads/" : "/downloads/",
      description: "Dossier partagé accessible depuis la galerie",
    },
    {
      location: "cache",
      label: "Cache temporaire",
      path: FileSystem.cacheDirectory ?? "/cache/",
      description: "Stockage temporaire (effacé automatiquement)",
    },
  ];
};

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<StorageLocation>("downloads");
  const [freeSpace, setFreeSpace] = useState("—");
  const storageOptions = getOptions();

  useEffect(() => {
    loadSavedLocation();
    loadFreeSpace();
  }, []);

  const loadSavedLocation = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) setCurrentLocation(saved as StorageLocation);
  };

  const loadFreeSpace = async () => {
    if (Platform.OS === "web") {
      setFreeSpace("—");
      return;
    }
    try {
      const info = await FileSystem.getFreeDiskStorageAsync();
      const gb = info / (1024 * 1024 * 1024);
      if (gb >= 1) {
        setFreeSpace(`${gb.toFixed(1)} Go`);
      } else {
        const mb = info / (1024 * 1024);
        setFreeSpace(`${mb.toFixed(0)} Mo`);
      }
    } catch {
      setFreeSpace("—");
    }
  };

  const setLocation = async (loc: StorageLocation) => {
    setCurrentLocation(loc);
    await AsyncStorage.setItem(STORAGE_KEY, loc);

    if (Platform.OS !== "web") {
      const opt = storageOptions.find((o) => o.location === loc);
      if (opt) {
        try {
          const info = await FileSystem.getInfoAsync(opt.path);
          if (!info.exists) {
            await FileSystem.makeDirectoryAsync(opt.path, { intermediates: true });
          }
        } catch {}
      }
    }
  };

  const currentPath = storageOptions.find((o) => o.location === currentLocation)?.path ?? "";

  return (
    <StorageContext.Provider value={{ currentLocation, storageOptions, setLocation, currentPath, freeSpace }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within StorageProvider");
  return ctx;
}
