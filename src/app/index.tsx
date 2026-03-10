import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function IndexScreen() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/(auth)/login");
    } else if (!profile?.family_id) {
      router.replace("/(auth)/create-family");
    } else {
      router.replace("/(tabs)");
    }
  }, [session, profile, loading]);

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
