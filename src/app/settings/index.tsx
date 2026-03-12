import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { sendFamilyInvite } from "@/services/families";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, isAnonymous, linkEmail, setupProfile, signOut } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSent, setRegisterSent] = useState("");

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [error, setError] = useState("");

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setNameLoading(true);
    setError("");
    try {
      await setupProfile(displayName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setNameLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !profile?.family_id) return;
    setInviteLoading(true);
    setError("");
    try {
      await sendFamilyInvite(inviteEmail.trim(), profile.family_id, profile.display_name ?? undefined);
      setInviteSent(inviteEmail.trim());
      setInviteEmail("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRegister() {
    if (!registerEmail.trim()) return;
    setRegisterLoading(true);
    setError("");
    try {
      await linkEmail(registerEmail.trim());
      setRegisterSent(registerEmail.trim());
      setRegisterEmail("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("settings.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* プロフィール編集 */}
      {!isAnonymous && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.profile")}
          </Text>

          <Input
            label={t("settings.displayName")}
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setNameSaved(false);
            }}
          />

          {nameSaved && (
            <Text style={[styles.success, { color: colors.success }]}>
              {t("settings.nameSaved")}
            </Text>
          )}

          <Button
            title={t("common.save")}
            onPress={handleSaveName}
            loading={nameLoading}
            disabled={!displayName.trim() || displayName.trim() === profile?.display_name}
          />
        </View>
      )}

      {/* ゲストモード表示 + アカウント登録 */}
      {isAnonymous && (
        <View style={styles.section}>
          <View style={styles.guestBanner}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={[styles.guestText, { color: colors.textSecondary }]}>
              {t("settings.guestMode")}
            </Text>
          </View>

          <Text style={[styles.registerPrompt, { color: colors.textSecondary }]}>
            {t("settings.registerPrompt")}
          </Text>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          {registerSent ? (
            <Text style={[styles.success, { color: colors.success }]}>
              {t("settings.registerSent", { email: registerSent })}
            </Text>
          ) : (
            <>
              <Input
                label={t("settings.registerEmail")}
                placeholder={t("settings.registerEmailPlaceholder")}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Button
                title={t("settings.registerEmail")}
                onPress={handleRegister}
                loading={registerLoading}
                disabled={!registerEmail.trim()}
              />
            </>
          )}
        </View>
      )}

      {/* 家族招待（登録済みユーザーのみ） */}
      {!isAnonymous && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.inviteMember")}
          </Text>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          {inviteSent ? (
            <Text style={[styles.success, { color: colors.success }]}>
              {t("settings.inviteSent", { email: inviteSent })}
            </Text>
          ) : null}

          <Input
            label={t("settings.inviteEmail")}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            title={t("settings.inviteMember")}
            onPress={handleInvite}
            loading={inviteLoading}
            disabled={!inviteEmail.trim()}
          />
        </View>
      )}

      {/* 招待しようとした匿名ユーザーへのメッセージ */}
      {isAnonymous && !registerSent && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.inviteMember")}
          </Text>
          <Text style={[styles.registerRequired, { color: colors.textSecondary }]}>
            {t("settings.registerRequired")}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {!isAnonymous && (
          <Button
            title={t("auth.logout")}
            onPress={async () => {
              await signOut();
              router.replace("/");
            }}
            variant="danger"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  guestText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  registerPrompt: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  registerRequired: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  error: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  success: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    marginTop: "auto",
  },
});
