import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useEvent, useDeleteEvent } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateTime } from "@/utils/date";
import { REMINDER_PRESETS } from "@/constants/reminders";

function formatReminderLabel(minutes: number, t: (key: string) => string): string {
  const preset = REMINDER_PRESETS.find((p) => p.minutes === minutes);
  if (preset) return t(preset.labelKey);
  return `${minutes}${t("event.reminderMinutes")}`;
}

export default function EventDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: event, isLoading } = useEvent(id);
  const deleteEvent = useDeleteEvent();

  function handleDelete() {
    Alert.alert(t("event.delete"), t("event.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (id) {
            await deleteEvent.mutateAsync(id);
            router.back();
          }
        },
      },
    ]);
  }

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

  if (!event) {
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

  const isOwner = profile?.id === event.created_by;
  const reminders: number[] = event.reminders ?? [];

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

        <Card style={styles.card}>
          <Text style={[styles.title, { color: colors.text }]}>
            {event.title}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {event.all_day
                ? t("calendar.allDay")
                : `${formatDateTime(event.start_at)} - ${formatDateTime(event.end_at)}`}
            </Text>
          </View>

          {reminders.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {reminders
                  .map((m) => formatReminderLabel(m, t))
                  .join("、")}
              </Text>
            </View>
          )}

          {event.notes ? (
            <View style={styles.notesSection}>
              <Text
                style={[styles.notesLabel, { color: colors.textSecondary }]}
              >
                {t("event.notes")}
              </Text>
              <Text style={[styles.notesText, { color: colors.text }]}>
                {event.notes}
              </Text>
            </View>
          ) : null}
        </Card>

        {isOwner && (
          <View style={styles.actions}>
            <Button
              title={t("event.delete")}
              onPress={handleDelete}
              variant="danger"
              loading={deleteEvent.isPending}
            />
          </View>
        )}
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
  card: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.md,
    flex: 1,
  },
  notesSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  notesLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.sm,
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
