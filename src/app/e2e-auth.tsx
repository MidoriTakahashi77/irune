import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";

/**
 * E2E test auth route.
 * Handles irune://e2e-auth?access_token=...&refresh_token=...
 * Sets the Supabase session and redirects to the main app.
 */
export default function E2EAuth() {
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    async function injectSession() {
      const { access_token, refresh_token } = params;
      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        router.replace("/(tabs)/calendar");
      } else {
        router.replace("/");
      }
    }
    injectSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
