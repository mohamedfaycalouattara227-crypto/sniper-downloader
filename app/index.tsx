import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Redirect href="/(main)/download" />;
  }
  return <Redirect href="/(auth)/login" />;
}
