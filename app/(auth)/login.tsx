import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Remplissez tous les champs");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(main)/download");
    } else {
      setError(result.error ?? "Erreur de connexion");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="download-circle" size={52} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Sniper</Text>
          <Text style={[styles.appNameAccent, { color: colors.primary }]}>Downloader</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Téléchargeur Multimédia Ultra-Pro
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.title, { color: colors.foreground }]}>Connexion</Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "20", borderColor: colors.destructive }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorMsg, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Mot de passe"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather name="log-in" size={18} color={colors.primaryForeground} />
                <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>
                  Se connecter
                </Text>
              </>
            )}
          </Pressable>

        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Pas encore de compte ?
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}> Créer un compte</Text>
          </Pressable>
        </View>

        <Text style={[styles.devCredit, { color: colors.mutedForeground + "80" }]}>
          Développé par Mohamed Fayçal Ouattara
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  appNameAccent: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
    marginTop: -6,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
  form: {
    gap: 14,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorMsg: { fontSize: 13, flex: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: { padding: 4 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 6,
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  disabled: { opacity: 0.7 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  devCredit: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
