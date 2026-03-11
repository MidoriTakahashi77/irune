import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUpsertNote } from "@/hooks/useNotes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function NewNoteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const upsertNote = useUpsertNote();

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert(t("notebook.titleRequired"));
      return;
    }
    if (!profile?.family_id) return;

    await upsertNote.mutateAsync({
      family_id: profile.family_id,
      created_by: profile.id,
      note_type: "free",
      title: title.trim(),
      body: { content: body },
    });

    router.back();
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.cancel")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t("notebook.newFreeNote")}
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
          label={t("notebook.noteTitle")}
          value={title}
          onChangeText={setTitle}
          placeholder={t("notebook.noteTitlePlaceholder")}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("notebook.noteBody")}
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          placeholder={t("notebook.noteBodyPlaceholder")}
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
