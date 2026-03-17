import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

  const handleLifeNotePress = useCallback(
    (type: string, existingNoteId?: string) => {
      if (existingNoteId) {
        router.push(`/(tabs)/notebook/edit/${existingNoteId}`);
      } else {
        router.push(`/(tabs)/notebook/template/${type}`);
      }
    },
    [router]
  );

  const handleFreeNotePress = useCallback(
    (id: string) => {
      router.push(`/(tabs)/notebook/${id}`);
    },
    [router]
  );

  const handleNewNote = useCallback(() => {
    router.push("/(tabs)/notebook/new");
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("tabs.notebook")}
        </Text>
        {activeTab === "lifenote" && (
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => router.push("/(tabs)/notebook/visibility")}
          >
            <Text style={[styles.visibilityButtonText, { color: colors.primary }]}>
              {t("visibility.title")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          testID="tab-lifenote"
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
          testID="tab-free"
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
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : activeTab === "lifenote" ? (
          <LifeNoteGrid notes={notes} onPress={handleLifeNotePress} />
        ) : (
          <FreeNoteList notes={notes} onPress={handleFreeNotePress} />
        )}
      </ScrollView>

      {activeTab === "free" && (
        <FAB icon="add" onPress={handleNewNote} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  visibilityButton: {
    padding: Spacing.sm,
  },
  visibilityButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
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
