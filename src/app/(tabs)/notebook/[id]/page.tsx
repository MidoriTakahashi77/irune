import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  useNotebookPages,
  useCreateNotebookPage,
  useUpdateNotebookPage,
  useDeleteNotebookPage,
} from "@/hooks/useNotes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PageEditorScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    id: noteId,
    pageId,
    position: positionParam,
  } = useLocalSearchParams<{ id: string; pageId?: string; position?: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const isEditing = !!pageId;
  const { data: pages = [] } = useNotebookPages(noteId);
  const createPage = useCreateNotebookPage();
  const updatePage = useUpdateNotebookPage();
  const deletePage = useDeleteNotebookPage();

  const existingPage = isEditing ? pages.find((p) => p.id === pageId) : undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title);
      setContent(existingPage.content);
    }
  }, [existingPage]);

  const isSaving = createPage.isPending || updatePage.isPending;

  async function handleSave() {
    if (isEditing && pageId) {
      await updatePage.mutateAsync({
        id: pageId,
        title: title.trim(),
        content,
      });
    } else {
      const position = positionParam ? parseInt(positionParam, 10) : pages.length;
      await createPage.mutateAsync({
        note_id: noteId,
        title: title.trim(),
        content,
        position,
      });
    }
    router.back();
  }

  function handleDeletePage() {
    if (!pageId) return;
    Alert.alert(t("notebook.deletePageConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await deletePage.mutateAsync(pageId);
          router.back();
        },
      },
    ]);
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
          {isEditing ? t("notebook.editPage") : t("notebook.newPage")}
        </Text>
        <Button
          title={t("common.save")}
          onPress={handleSave}
          loading={isSaving}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t("notebook.pageTitle")}
          value={title}
          onChangeText={setTitle}
          placeholder={t("notebook.pageTitlePlaceholder")}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("notebook.pageContent")}
        </Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder={t("notebook.pageContentPlaceholder")}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.textArea,
            {
              backgroundColor: colors.backgroundElement,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />

        {isEditing && (
          <Button
            title={t("notebook.deletePage")}
            onPress={handleDeletePage}
            variant="ghost"
            textStyle={{ color: colors.error }}
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
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  textArea: {
    fontSize: FontSize.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 200,
    textAlignVertical: "top",
  },
});
