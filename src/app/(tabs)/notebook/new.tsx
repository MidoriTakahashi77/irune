import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUpsertNote } from "@/hooks/useNotes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function NewNotebookScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [name, setName] = useState("");

  const upsertNote = useUpsertNote();

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert(t("notebook.titleRequired"));
      return;
    }
    if (!profile?.family_id) return;

    await upsertNote.mutateAsync({
      family_id: profile.family_id,
      created_by: profile.id,
      note_type: "free",
      title: name.trim(),
      body: null,
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
          {t("notebook.newNotebook")}
        </Text>
        <Button
          title={t("common.save")}
          onPress={handleCreate}
          loading={upsertNote.isPending}
        />
      </View>

      <View style={styles.content}>
        <Input
          label={t("notebook.notebookName")}
          value={name}
          onChangeText={setName}
          placeholder={t("notebook.notebookNamePlaceholder")}
          autoFocus
        />
      </View>
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
});
