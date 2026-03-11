import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScheduleCard } from "./ScheduleCard";
import type { EventRow } from "@/types/events";

interface ScheduleListProps {
  events: EventRow[];
  title: string;
  onEventPress: (event: EventRow) => void;
}

export function ScheduleList({ events, title, onEventPress }: ScheduleListProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const renderItem = useCallback(
    ({ item }: { item: EventRow }) => (
      <ScheduleCard event={item} onPress={onEventPress} />
    ),
    [onEventPress]
  );

  const keyExtractor = useCallback((item: EventRow) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {events.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          {t("calendar.noEvents")}
        </Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  empty: {
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
});
