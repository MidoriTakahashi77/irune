import { useState } from "react";
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { magicLinkSchema, type MagicLinkFormData } from "@/utils/validation";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendMagicLink, verifyOtp } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: MagicLinkFormData) {
    setLoading(true);
    setError("");
    try {
      await sendMagicLink(data.email);
      setSentEmail(data.email);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyOtp(sentEmail, otpCode);
      router.replace("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      await sendMagicLink(sentEmail);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (sentEmail) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.sentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Ionicons
              name="mail-outline"
              size={64}
              color={colors.primary}
            />
            <Text style={[styles.sentTitle, { color: colors.text }]}>
              {t("auth.checkEmail")}
            </Text>
            <Text style={[styles.sentMessage, { color: colors.textSecondary }]}>
              {t("auth.magicLinkSent", { email: sentEmail })}
            </Text>

            {error ? (
              <Text style={[styles.error, { color: colors.error }]}>
                {error}
              </Text>
            ) : null}

            <View style={styles.otpSection}>
              <Input
                label={t("auth.otpCode")}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
              />
              <Button
                title={t("auth.verify")}
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otpCode.length !== 6}
              />
            </View>

            <Button
              title={t("auth.resend")}
              onPress={handleResend}
              variant="ghost"
              loading={loading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text }]}>irune</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("auth.login")}
          </Text>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.email")}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Button
            title={t("auth.sendMagicLink")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.lg,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
  },
  sentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sentTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    marginTop: Spacing.md,
  },
  sentMessage: {
    fontSize: FontSize.md,
    textAlign: "center",
    lineHeight: 24,
  },
  otpSection: {
    width: "100%",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
});
