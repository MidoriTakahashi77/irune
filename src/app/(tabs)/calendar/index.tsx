import { useState, useMemo } from "react";
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
import { useEvents } from "@/hooks/useEvents";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { FAB } from "@/components/ui/FAB";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMonthRange, isSameDayCheck } from "@/utils/date";
import type { EventRow } from "@/types/events";

export default function CalendarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { selectedDate, setSelectedDate, currentMonth, setCurrentMonth } =
    useCalendarStore();

  const { start, end } = getMonthRange(currentMonth);
  const { data: events = [] } = useEvents(profile?.family_id, start, end);

  const selectedEvents = useMemo(
    () =>
      events.filter((e) => isSameDayCheck(e.start_at, selectedDate)),
    [events, selectedDate]
  );

  const [showFabMenu, setShowFabMenu] = useState(false);

  function handleEventPress(event: EventRow) {
    router.push(`/(tabs)/calendar/event/${event.id}`);
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("calendar.title")}
        </Text>

        <MonthlyCalendar
          events={events}
          selectedDate={selectedDate}
          onDayPress={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />

        <ScheduleList
          events={selectedEvents}
          title={t("calendar.todaySchedule")}
          onEventPress={handleEventPress}
        />
      </ScrollView>

      {showFabMenu && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={[styles.fabMenuItem, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowFabMenu(false);
              router.push("/(tabs)/calendar/new-event");
            }}
          >
            <Text style={styles.fabMenuText}>{t("calendar.newEvent")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabMenuItem, { backgroundColor: colors.success }]}
            onPress={() => {
              setShowFabMenu(false);
              router.push("/(tabs)/calendar/new-diary");
            }}
          >
            <Text style={styles.fabMenuText}>{t("calendar.newDiary")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FAB
        onPress={() => setShowFabMenu(!showFabMenu)}
        icon={showFabMenu ? "close" : "add"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    padding: Spacing.lg,
  },
  fabMenu: {
    position: "absolute",
    right: 20,
    bottom: 96,
    gap: Spacing.sm,
    alignItems: "flex-end",
  },
  fabMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  fabMenuText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
});
