import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { LifeNoteGrid } from "@/components/notebook/LifeNoteGrid";
import { FreeNoteList } from "@/components/notebook/FreeNoteList";
import { FAB } from "@/components/ui/FAB";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Tab = "lifenote" | "free";

export default function NotebookScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: notes = [], isLoading } = useNotes(profile?.family_id);
  const [activeTab, setActiveTab] = useState<Tab>("lifenote");

  function handleLifeNotePress(type: string, existingNoteId?: string) {
    if (existingNoteId) {
      router.push(`/(tabs)/notebook/edit/${existingNoteId}`);
    } else {
      router.push(`/(tabs)/notebook/template/${type}`);
    }
  }

  function handleFreeNotePress(id: string) {
    router.push(`/(tabs)/notebook/${id}`);
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("tabs.notebook")}
      </Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "lifenote" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("lifenote")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "lifenote"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            {t("notebook.lifenote")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "free" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("free")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "free"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            {t("notebook.freeNote")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>
              {t("common.loading")}
            </Text>
          </View>
        ) : activeTab === "lifenote" ? (
          <LifeNoteGrid notes={notes} onPress={handleLifeNotePress} />
        ) : (
          <FreeNoteList notes={notes} onPress={handleFreeNotePress} />
        )}
      </ScrollView>

      {activeTab === "free" && (
        <FAB
          icon="add"
          onPress={() => router.push("/(tabs)/notebook/new")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
});
