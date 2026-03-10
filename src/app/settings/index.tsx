import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { sendFamilyInvite } from "@/services/families";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState("");
  const [error, setError] = useState("");

  async function handleInvite() {
    if (!inviteEmail.trim() || !profile?.family_id) return;
    setInviteLoading(true);
    setError("");
    try {
      await sendFamilyInvite(inviteEmail.trim(), profile.family_id);
      setInviteSent(inviteEmail.trim());
      setInviteEmail("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("settings.title")}
      </Text>

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

      <View style={styles.footer}>
        <Button
          title={t("auth.logout")}
          onPress={signOut}
          variant="danger"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    padding: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
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
