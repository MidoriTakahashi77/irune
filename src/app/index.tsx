import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function IndexScreen() {
  const router = useRouter();
  const {
    session,
    profile,
    loading,
    isAnonymous,
    pendingFamilyId,
    signInAnonymously,
  } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    if (loading || settingUp) return;

    if (!session) {
      // セッション無し → 匿名サインインで即利用開始
      setSettingUp(true);
      signInAnonymously()
        .then(() => {
          router.replace("/(tabs)");
        })
        .catch((err) => {
          console.error("Anonymous sign-in failed:", err);
          // フォールバック: ログイン画面へ
          router.replace("/(auth)/login");
        })
        .finally(() => setSettingUp(false));
      return;
    }

    // セッションあり（匿名 or 登録済み）
    if (isAnonymous) {
      // 匿名ユーザーはプロフィール・家族が自動作成済み → タブへ
      if (profile?.family_id) {
        router.replace("/(tabs)");
      }
      // プロフィールがまだ無い場合はloadingが終わるまで待つ
      return;
    }

    // 登録済みユーザー → 従来のフロー
    if (!profile) {
      router.replace("/(auth)/set-profile");
    } else if (pendingFamilyId) {
      router.replace("/(auth)/join-family");
    } else if (!profile.family_id) {
      router.replace("/(auth)/create-family");
    } else {
      router.replace("/(tabs)");
    }
  }, [session, profile, loading, isAnonymous, pendingFamilyId, settingUp]);

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
