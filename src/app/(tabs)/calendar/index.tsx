import { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { DayDetailSheet } from "@/components/calendar/DayDetailSheet";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMonthRange, isSameDayCheck, toDateString } from "@/utils/date";
import { getOriginalEventId } from "@/utils/recurrence";
import type { EventRow } from "@/types/events";

export default function CalendarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const { selectedDate, setSelectedDate, currentMonth, setCurrentMonth } =
    useCalendarStore();

  const { start, end } = getMonthRange(currentMonth);
  const { data: events = [] } = useEvents(profile?.family_id, start, end);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const now = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === now.getFullYear() &&
    currentMonth.getMonth() === now.getMonth();

  const selectedEvents = useMemo(
    () => events.filter((e) => isSameDayCheck(e.start_at, selectedDate)),
    [events, selectedDate]
  );

  function handleDayPress(date: string) {
    setSelectedDate(date);
    setSheetVisible(true);
  }

  function handleEventPress(event: EventRow) {
    setSheetVisible(false);
    router.push(`/(tabs)/calendar/event/${getOriginalEventId(event.id)}`);
  }

  function handleAddEvent() {
    setSheetVisible(false);
    router.push("/(tabs)/calendar/new-event");
  }

  function jumpToToday() {
    const today = toDateString(new Date());
    setSelectedDate(today);
    setCurrentMonth(new Date());
    setCalendarKey((k) => k + 1);
  }

  function jumpToDate(date: Date) {
    const dateStr = toDateString(date);
    setSelectedDate(dateStr);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setCalendarKey((k) => k + 1);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            paddingTop: insets.top + 4,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.toolbarActions}>
          {!isCurrentMonth && (
            <TouchableOpacity
              style={[
                styles.todayButton,
                { backgroundColor: colors.backgroundElement },
              ]}
              onPress={jumpToToday}
              activeOpacity={0.7}
            >
              <Ionicons name="today-outline" size={14} color={colors.text} />
              <Text style={[styles.todayButtonText, { color: colors.text }]}>
                {t("calendar.today")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.jumpButton,
            { backgroundColor: colors.backgroundElement },
          ]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-number-outline"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <MonthlyCalendar
        key={calendarKey}
        events={events}
        selectedDate={selectedDate}
        onDayPress={handleDayPress}
        onMonthChange={setCurrentMonth}
      />

      {/* Date picker modal */}
      {showDatePicker && (
        <View
          style={[
            styles.datePickerOverlay,
            {
              backgroundColor:
                scheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View
            style={[
              styles.datePickerCard,
              {
                backgroundColor: scheme === "dark" ? "#1E1F23" : "#FFFFFF",
              },
            ]}
          >
            <View style={styles.datePickerHeader}>
              <Text style={[styles.datePickerTitle, { color: colors.text }]}>
                {t("calendar.jumpToDate")}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={new Date(selectedDate + "T00:00:00")}
              mode="date"
              locale="ja"
              display="spinner"
              onChange={(_: DateTimePickerEvent, d?: Date) => {
                if (Platform.OS === "android") {
                  setShowDatePicker(false);
                  if (d) jumpToDate(d);
                }
                if (d && Platform.OS === "ios") {
                  jumpToDate(d);
                }
              }}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[styles.datePickerDone, { backgroundColor: colors.primary }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <DayDetailSheet
        visible={sheetVisible}
        date={selectedDate}
        events={selectedEvents}
        onClose={() => setSheetVisible(false)}
        onEventPress={handleEventPress}
        onAddEvent={handleAddEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  jumpButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  datePickerCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "85%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  datePickerDone: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  datePickerDoneText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
