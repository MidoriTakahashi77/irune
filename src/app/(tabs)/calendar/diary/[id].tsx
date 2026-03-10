import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDiaryEntry } from "@/hooks/useDiaryEntries";
import { getMediaUrl } from "@/services/storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date";

export default function DiaryDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: entry, isLoading } = useDiaryEntry(id);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t("common.error")}
        </Text>
      </SafeAreaView>
    );
  }

  const media = (entry as any).diary_media ?? [];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Button
            title={t("common.back")}
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>

        <Card>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(entry.entry_date)}
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>
            {entry.title}
          </Text>

          {entry.mood ? (
            <Text style={styles.mood}>{entry.mood}</Text>
          ) : null}

          {entry.body ? (
            <Text style={[styles.body, { color: colors.text }]}>
              {entry.body}
            </Text>
          ) : null}

          {entry.location ? (
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              📍 {entry.location}
            </Text>
          ) : null}

          {media.length > 0 && (
            <ScrollView horizontal style={styles.mediaRow}>
              {media.map((m: any) => (
                <Image
                  key={m.id}
                  source={{ uri: getMediaUrl(m.storage_path) }}
                  style={styles.mediaImage}
                />
              ))}
            </ScrollView>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {entry.tags.map((tag: string, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  date: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  mood: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  location: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  mediaRow: {
    marginBottom: Spacing.md,
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontSize: FontSize.md,
  },
});
