import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { registerSchema, type RegisterFormData } from "@/utils/validation";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      generation: "parent",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError("");
    try {
      await signUp(data.email, data.password, data.displayName, data.generation);
      router.replace("/(auth)/create-family");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const generations = [
    { value: "grandparent", label: t("auth.grandparent") },
    { value: "parent", label: t("auth.parent") },
    { value: "child", label: t("auth.child") },
  ] as const;

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
          <Text style={[styles.title, { color: colors.text }]}>
            {t("auth.register")}
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.password")}
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.displayName")}
                value={value}
                onChangeText={onChange}
                error={errors.displayName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="generation"
            render={({ field: { onChange, value } }) => (
              <View style={styles.generationContainer}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  {t("auth.generation")}
                </Text>
                <View style={styles.generationRow}>
                  {generations.map((gen) => (
                    <TouchableOpacity
                      key={gen.value}
                      style={[
                        styles.generationPill,
                        {
                          backgroundColor:
                            value === gen.value
                              ? colors.primary
                              : colors.backgroundElement,
                        },
                      ]}
                      onPress={() => onChange(gen.value)}
                    >
                      <Text
                        style={[
                          styles.generationText,
                          {
                            color:
                              value === gen.value ? "#FFFFFF" : colors.text,
                          },
                        ]}
                      >
                        {gen.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <Button
            title={t("auth.register")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {t("auth.hasAccount")}
            </Text>
          </TouchableOpacity>
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
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
  },
  label: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  generationContainer: {
    marginBottom: Spacing.md,
  },
  generationRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  generationPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  generationText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  link: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  linkText: {
    fontSize: FontSize.md,
  },
});
