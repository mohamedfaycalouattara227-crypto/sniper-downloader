import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  downloadCount: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  getAllUsers: () => User[];
  activatePremium: (userId: string) => Promise<void>;
  deactivatePremium: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "vdl_users";
const CURRENT_USER_KEY = "vdl_current_user";

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      let users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

      const adminExists = users.find((u) => u.isAdmin);
      if (!adminExists) {
        const admin: User = {
          id: generateId(),
          email: "admin@vdl.app",
          name: "Mohamed Fayçal Ouattara",
          isPremium: true,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          downloadCount: 0,
        };
        users.push(admin);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        await AsyncStorage.setItem(
          "vdl_passwords",
          JSON.stringify({ [admin.id]: "admin2024" })
        );
      }

      const currentUserRaw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserRaw) {
        const savedUser = JSON.parse(currentUserRaw);
        const freshUser = users.find((u) => u.id === savedUser.id);
        if (freshUser) setUser(freshUser);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      const passwordsRaw = await AsyncStorage.getItem("vdl_passwords");
      const passwords: Record<string, string> = passwordsRaw ? JSON.parse(passwordsRaw) : {};

      const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) return { success: false, error: "Compte introuvable" };

      if (passwords[foundUser.id] !== password) return { success: false, error: "Mot de passe incorrect" };

      setUser(foundUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
      return { success: true };
    } catch {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      const passwordsRaw = await AsyncStorage.getItem("vdl_passwords");
      const passwords: Record<string, string> = passwordsRaw ? JSON.parse(passwordsRaw) : {};

      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return { success: false, error: "Cet email est déjà utilisé" };

      const newUser: User = {
        id: generateId(),
        email,
        name,
        isPremium: false,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        downloadCount: 0,
      };

      users.push(newUser);
      passwords[newUser.id] = password;

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem("vdl_passwords", JSON.stringify(passwords));
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      const updated = users[idx];
      setUser(updated);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }
  };

  const getAllUsers = () => {
    return [];
  };

  const activatePremium = async (userId: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].isPremium = true;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      if (user && user.id === userId) {
        setUser(users[idx]);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[idx]));
      }
    }
  };

  const deactivatePremium = async (userId: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].isPremium = false;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      if (user && user.id === userId) {
        setUser(users[idx]);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[idx]));
      }
    }
  };

  const deleteUser = async (userId: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    let users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    users = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser, getAllUsers, activatePremium, deactivatePremium, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
