import { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { formatTime } from "@/utils/date";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";
import type { EventRow } from "@/types/events";

interface ScheduleCardProps {
  event: EventRow;
  onPress: (event: EventRow) => void;
}

export const ScheduleCard = memo(function ScheduleCard({ event, onPress }: ScheduleCardProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.timeRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {event.all_day
              ? t("calendar.allDay")
              : `${formatTime(event.start_at)} - ${formatTime(event.end_at)}`}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  time: {
    fontSize: FontSize.sm,
  },
});
