import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { parseISO, format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useEvent, useDeleteEvent } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { REMINDER_PRESETS } from "@/constants/reminders";

function formatReminderLabel(minutes: number, t: (key: string) => string): string {
  const preset = REMINDER_PRESETS.find((p) => p.minutes === minutes);
  if (preset) return t(preset.labelKey);
  return `${minutes}${t("event.reminderMinutes")}`;
}

function formatEventDateRange(startAt: string, endAt: string, allDay: boolean, t: (key: string) => string) {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  const dateFmt = "M月d日(E)";

  if (allDay) {
    if (isSameDay(start, end)) {
      return { date: format(start, dateFmt, { locale: ja }), time: t("calendar.allDay") };
    }
    return {
      date: `${format(start, dateFmt, { locale: ja })} 〜 ${format(end, dateFmt, { locale: ja })}`,
      time: t("calendar.allDay"),
    };
  }

  const timeFmt = "H:mm";
  if (isSameDay(start, end)) {
    return {
      date: format(start, dateFmt, { locale: ja }),
      time: `${format(start, timeFmt)} 〜 ${format(end, timeFmt)}`,
    };
  }
  return {
    date: `${format(start, dateFmt, { locale: ja })} 〜 ${format(end, dateFmt, { locale: ja })}`,
    time: `${format(start, timeFmt)} 〜 ${format(end, timeFmt)}`,
  };
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
  const { date: dateLabel, time: timeLabel } = formatEventDateRange(
    event.start_at,
    event.end_at,
    event.all_day ?? false,
    t
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header: 戻る + 編集アイコン */}
        <View style={styles.header}>
          <Button
            title={t("common.back")}
            onPress={() => router.back()}
            variant="ghost"
          />
          {isOwner && (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push(`/calendar/edit-event/${id}`)}
              accessibilityLabel={t("event.edit")}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <Card style={styles.card}>
          {/* カラーバー + タイトル */}
          <View style={styles.titleRow}>
            {event.color && (
              <View style={[styles.colorBar, { backgroundColor: event.color }]} />
            )}
            <Text style={[styles.title, { color: colors.text }]}>
              {event.title}
            </Text>
          </View>

          {/* 日時: 日付と時間を分けて表示 */}
          <View style={[styles.infoBlock, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {dateLabel}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {timeLabel}
              </Text>
            </View>
          </View>

          {/* リマインダー */}
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

          {/* メモ */}
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

        {/* 削除: テキストリンク風 */}
        {isOwner && (
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={handleDelete}
            disabled={deleteEvent.isPending}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.deleteLinkText, { color: colors.error }]}>
              {t("event.delete")}
            </Text>
          </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  colorBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    flex: 1,
  },
  infoBlock: {
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: "500",
  },
  infoText: {
    fontSize: FontSize.md,
    flex: 1,
  },
  notesSection: {
    marginTop: Spacing.sm,
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
  deleteLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
  },
  deleteLinkText: {
    fontSize: FontSize.sm,
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
