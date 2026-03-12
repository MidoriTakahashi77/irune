import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUpsertNote } from "@/hooks/useNotes";
import { supabase } from "@/lib/supabase";
import { TemplateFormRenderer } from "@/components/notebook/TemplateFormRenderer";
import { WizardForm } from "@/components/notebook/WizardForm";
import { getTemplateByType } from "@/constants/lifenote-templates";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteBody } from "@/types/notes";

const WIZARD_TYPES = ["life_care", "life_funeral"] as const;
type WizardType = (typeof WIZARD_TYPES)[number];

export default function TemplateFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const template = getTemplateByType(type ?? "");
  const upsertNote = useUpsertNote();
  const [values, setValues] = useState<LifeNoteBody>({});
  const needsWizard = WIZARD_TYPES.includes(type as WizardType);
  const [showWizard, setShowWizard] = useState(needsWizard);

  function handleChange(key: string, value: Json) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!template || !profile?.family_id) return;

    const title = t(template.titleKey);

    // life_profile の場合、display_name をプロフィールにも反映
    if (template.type === "life_profile" && values.display_name) {
      await supabase
        .from("profiles")
        .update({ display_name: values.display_name as string })
        .eq("id", profile.id);
    }

    await upsertNote.mutateAsync({
      family_id: profile.family_id,
      created_by: profile.id,
      note_type: template.type,
      title,
      body: values,
    });

    router.back();
  }

  if (!template) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            {t("common.error")}
          </Text>
          <Button title={t("common.back")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (showWizard) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Button
            title={t("common.cancel")}
            onPress={() => router.back()}
            variant="ghost"
          />
          <Text style={[styles.topBarTitle, { color: colors.text }]}>
            {t(template.titleKey)}
          </Text>
          <View style={{ width: 60 }} />
        </View>
        <WizardForm
          type={type as WizardType}
          onComplete={(wizardValues) => {
            setValues((prev) => ({ ...prev, ...wizardValues }));
            setShowWizard(false);
          }}
          onSkip={() => setShowWizard(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.cancel")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t(template.titleKey)}
        </Text>
        <Button
          title={t("common.save")}
          onPress={handleSave}
          loading={upsertNote.isPending}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TemplateFormRenderer
          template={template}
          values={values}
          onChange={handleChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
});
