import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useNote, useDeleteNote, useNotebookPages } from "@/hooks/useNotes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FAB } from "@/components/ui/FAB";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date";

const MAX_PAGES = 100;

export default function NotebookDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: note, isLoading: noteLoading } = useNote(id);
  const { data: pages = [], isLoading: pagesLoading } = useNotebookPages(id);
  const deleteNote = useDeleteNote();

  const isLoading = noteLoading || pagesLoading;

  function handleAddPage() {
    if (pages.length >= MAX_PAGES) {
      Alert.alert(t("notebook.maxPagesReached"));
      return;
    }
    router.push(`/(tabs)/notebook/${id}/page?position=${pages.length}`);
  }

  function handleOpenPage(pageId: string) {
    router.push(`/(tabs)/notebook/${id}/page?pageId=${pageId}`);
  }

  function handleDeleteNotebook() {
    Alert.alert(t("notebook.deleteNotebookConfirm"), undefined, [
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
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{t("common.error")}</Text>
          <Button title={t("common.back")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.back")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Button
          title={t("common.delete")}
          onPress={handleDeleteNotebook}
          variant="ghost"
          textStyle={{ color: colors.error }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.pageCount, { color: colors.textSecondary }]}>
          {t("notebook.pageCount", { count: pages.length, max: MAX_PAGES })}
        </Text>

        {pages.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("notebook.noPagesYet")}
            </Text>
          </View>
        ) : (
          pages.map((page, index) => (
            <TouchableOpacity key={page.id} onPress={() => handleOpenPage(page.id)}>
              <Card style={styles.pageCard}>
                <View style={styles.pageRow}>
                  <Text style={[styles.pageNumber, { color: colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                  <View style={styles.pageInfo}>
                    <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
                      {page.title || t("notebook.untitledPage")}
                    </Text>
                    {page.content ? (
                      <Text
                        style={[styles.pagePreview, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {page.content}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {pages.length < MAX_PAGES && (
        <FAB icon="add" onPress={handleAddPage} />
      )}
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
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  pageCount: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
  pageCard: {
    marginBottom: 0,
  },
  pageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  pageNumber: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  pageInfo: {
    flex: 1,
    gap: 2,
  },
  pageTitle: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  pagePreview: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
