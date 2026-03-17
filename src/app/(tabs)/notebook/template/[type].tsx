import { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useNotes, useUpsertNote } from "@/hooks/useNotes";
import { supabase } from "@/lib/supabase";
import { TemplateFormRenderer } from "@/components/notebook/TemplateFormRenderer";
import { getTemplateByType } from "@/constants/lifenote-templates";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteBody } from "@/types/notes";
import type { VisibilityMode } from "@/types/events";

export default function TemplateFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const template = getTemplateByType(type ?? "");
  const upsertNote = useUpsertNote();
  const { data: notes = [] } = useNotes(profile?.family_id);
  const { data: members = [] } = useFamily(profile?.family_id);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const [values, setValues] = useState<LifeNoteBody>({});

  // 公開設定の状態
  const existingNote = notes.find((n) => n.note_type === type);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("all");
  const [visibilityIds, setVisibilityIds] = useState<string[]>([]);

  useEffect(() => {
    if (!existingNote) return;
    if (existingNote.is_locked) {
      const shared = existingNote.shared_with ?? [];
      setVisibilityMode(shared.length ? "custom" : "owner");
      setVisibilityIds(shared);
    } else {
      setVisibilityMode("all");
      setVisibilityIds([]);
    }
  }, [existingNote?.id, existingNote?.is_locked, existingNote?.shared_with]);

  const familyMembers = members
    .filter((m) => m.id !== profile?.id)
    .map((m) => ({ id: m.id, display_name: m.display_name, color: m.color }));

  const birthYear = (() => {
    const profileNote = notes.find((n) => n.note_type === "life_profile");
    const bd = (profileNote?.body as LifeNoteBody | null)?.birth_date as string | undefined;
    return bd ? new Date(bd).getFullYear() : undefined;
  })();

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
      ...(existingNote?.id ? { id: existingNote.id } : {}),
      family_id: profile.family_id,
      created_by: profile.id,
      note_type: template.type,
      title,
      body: values,
      is_locked: visibilityMode !== "all",
      shared_with: visibilityMode === "custom" ? visibilityIds : null,
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
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
      >
        <View style={styles.visibilityRow}>
          <Text style={[styles.visibilityLabel, { color: colors.textSecondary }]}>
            {t("visibility.noteVisibility")}
          </Text>
          <VisibilityPicker
            mode={visibilityMode}
            selectedIds={visibilityIds}
            members={familyMembers}
            onChange={(mode, ids) => {
              setVisibilityMode(mode);
              setVisibilityIds(ids);
            }}
            compact
          />
        </View>

        <TemplateFormRenderer
          template={template}
          values={values}
          onChange={handleChange}
          onSave={handleSave}
          birthYear={birthYear}
          scrollBy={(amount) => {
            scrollViewRef.current?.scrollTo({
              y: scrollOffsetRef.current + amount,
              animated: true,
            });
          }}
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
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  visibilityLabel: {
    fontSize: FontSize.sm,
    fontWeight: "500",
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
