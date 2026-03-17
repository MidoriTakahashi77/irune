import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useNotes, useUpsertNote } from "@/hooks/useNotes";
import { LIFE_NOTE_TEMPLATES } from "@/constants/lifenote-templates";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { VisibilityMode, NoteWithPageCount } from "@/types/events";

export default function VisibilityOverviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: notes = [] } = useNotes(profile?.family_id);
  const { data: members = [] } = useFamily(profile?.family_id);
  const upsertNote = useUpsertNote();

  const familyMembers = members
    .filter((m) => m.id !== profile?.id)
    .map((m) => ({ id: m.id, display_name: m.display_name, color: m.color }));

  function getNoteForType(noteType: string): NoteWithPageCount | undefined {
    return notes.find((n) => n.note_type === noteType);
  }

  function getVisibility(noteType: string): { mode: VisibilityMode; ids: string[] } {
    const note = getNoteForType(noteType);
    if (!note) return { mode: "all", ids: [] };
    if (!note.is_locked) return { mode: "all", ids: [] };
    if (note.shared_with?.length) return { mode: "custom", ids: note.shared_with };
    return { mode: "owner", ids: [] };
  }

  async function handleChange(noteType: string, mode: VisibilityMode, ids: string[]) {
    const note = getNoteForType(noteType);
    if (!note || !profile?.family_id) return;

    await upsertNote.mutateAsync({
      id: note.id,
      family_id: profile.family_id,
      created_by: note.created_by,
      note_type: note.note_type,
      title: note.title,
      body: note.body,
      is_locked: mode !== "all",
      shared_with: mode === "custom" ? ids : null,
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.back")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t("visibility.overviewTitle")}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t("visibility.overviewDescription")}
        </Text>

        {LIFE_NOTE_TEMPLATES.map((tmpl) => {
          const note = getNoteForType(tmpl.type);
          const { mode, ids } = getVisibility(tmpl.type);

          return (
            <Card key={tmpl.type} style={styles.row}>
              <View style={styles.rowInner}>
                <View style={styles.rowLeft}>
                  <Ionicons
                    name={tmpl.icon as ComponentProps<typeof Ionicons>["name"]}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {t(tmpl.titleKey)}
                  </Text>
                </View>
                {note ? (
                  <VisibilityPicker
                    mode={mode}
                    selectedIds={ids}
                    members={familyMembers}
                    onChange={(m, i) => handleChange(tmpl.type, m, i)}
                    compact
                  />
                ) : (
                  <Text style={[styles.notCreated, { color: colors.textSecondary }]}>
                    {t("visibility.notCreatedYet")}
                  </Text>
                )}
              </View>
            </Card>
          );
        })}
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
    gap: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  row: {
    marginBottom: 0,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  rowLabel: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  notCreated: {
    fontSize: FontSize.sm,
    fontStyle: "italic",
  },
});
