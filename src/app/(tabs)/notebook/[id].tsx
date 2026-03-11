import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNote, useDeleteNote } from "@/hooks/useNotes";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date";
import { isLifeNoteType } from "@/constants/lifenote-templates";

export default function NoteDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: note, isLoading } = useNote(id);
  const deleteNote = useDeleteNote();

  function handleEdit() {
    if (!note) return;
    router.push(`/(tabs)/notebook/edit/${note.id}`);
  }

  function handleDelete() {
    Alert.alert(t("notebook.deleteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          await deleteNote.mutateAsync(id);
          router.back();
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            {t("common.error")}
          </Text>
          <Button title={t("common.back")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const body = note.body as Record<string, unknown> | null;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.back")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <View style={styles.topBarActions}>
          <Button title={t("common.edit")} onPress={handleEdit} />
          <Button
            title={t("common.delete")}
            onPress={handleDelete}
            variant="ghost"
            textStyle={{ color: colors.error }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {note.title}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(new Date(note.created_at))}
        </Text>

        {body && typeof body === "object" && (
          <View style={styles.body}>
            {Object.entries(body).map(([key, value]) => {
              if (!value) return null;
              return (
                <View key={key} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {t(`lifenote.fields.${key}`, key)}
                  </Text>
                  <Text style={[styles.fieldValue, { color: colors.text }]}>
                    {typeof value === "boolean"
                      ? value
                        ? t("common.yes", "はい")
                        : t("common.no", "いいえ")
                      : String(value)}
                  </Text>
                </View>
              );
            })}
          </View>
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
  topBarActions: {
    flexDirection: "row",
    gap: Spacing.xs,
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
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  date: {
    fontSize: FontSize.sm,
  },
  body: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: FontSize.md,
  },
});
