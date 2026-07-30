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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Remplissez tous les champs");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      setError("Mot de passe trop court (min 6 caractères)");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(main)/download");
    } else {
      setError(result.error ?? "Erreur lors de l'inscription");
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
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 30),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="account-plus" size={42} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Commencez à télécharger gratuitement
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "20", borderColor: colors.destructive }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorMsg, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          {[
            { icon: "user" as const, placeholder: "Nom complet", value: name, setter: setName, type: undefined },
            { icon: "mail" as const, placeholder: "Email", value: email, setter: setEmail, type: "email-address" as const },
          ].map((field, i) => (
            <View key={i} style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={field.icon} size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={field.value}
                onChangeText={field.setter}
                keyboardType={field.type}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Mot de passe (min 6 caractères)"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <Pressable
            style={[styles.registerBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather name="user-plus" size={18} color={colors.primaryForeground} />
                <Text style={[styles.registerBtnText, { color: colors.primaryForeground }]}>
                  Créer mon compte
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Déjà un compte ?
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}> Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: { marginBottom: 20 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  form: { gap: 14, marginBottom: 24 },
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
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 6,
  },
  registerBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  disabled: { opacity: 0.7 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
