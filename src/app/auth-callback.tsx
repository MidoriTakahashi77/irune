import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  useEffect(() => {
    // Supabase client will automatically detect the session from the URL hash
    // (detectSessionInUrl: true on web). Give it a moment, then redirect.
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
