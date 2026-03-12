import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNote, useUpsertNote } from "@/hooks/useNotes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TemplateFormRenderer } from "@/components/notebook/TemplateFormRenderer";
import { getTemplateByType } from "@/constants/lifenote-templates";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteBody } from "@/types/notes";

export default function EditNoteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: note, isLoading } = useNote(id);
  const upsertNote = useUpsertNote();

  const [title, setTitle] = useState("");
  const [bodyValues, setBodyValues] = useState<LifeNoteBody>({});

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      const body = note.body as LifeNoteBody | null;
      if (body) {
        setBodyValues(body);
      }
    }
  }, [note]);

  const template = note ? getTemplateByType(note.note_type) : undefined;

  function handleFieldChange(key: string, value: Json) {
    setBodyValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!note) return;
    if (!title.trim()) {
      Alert.alert(t("notebook.titleRequired"));
      return;
    }

    // life_profile の場合、display_name をプロフィールにも反映
    if (note.note_type === "life_profile" && bodyValues.display_name && profile) {
      await supabase
        .from("profiles")
        .update({ display_name: bodyValues.display_name as string })
        .eq("id", profile.id);
    }

    await upsertNote.mutateAsync({
      id: note.id,
      family_id: note.family_id,
      created_by: note.created_by,
      note_type: note.note_type,
      title: title.trim(),
      body: bodyValues,
      subject_id: note.subject_id,
    });

    router.back();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{t("common.loading")}</Text>
        </View>
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
          {t("common.edit")}
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
        <Input
          label={t("lifenote.noteTitle", "タイトル")}
          value={title}
          onChangeText={setTitle}
        />

        {template && (
          <TemplateFormRenderer
            template={template}
            values={bodyValues}
            onChange={handleFieldChange}
          />
        )}
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
  },
});
