import { useMemo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarList, type DayInfo } from "@/components/calendar-kit";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, FontSize } from "@/constants/theme";
import type { EventRow } from "@/types/events";
import { toDateString } from "@/utils/date";
import { getHolidayName } from "@/constants/holidays";

type SpanPosition = "single" | "start" | "middle" | "end";

interface DayEvent {
  event: EventRow;
  position: SpanPosition;
}

interface MonthlyCalendarProps {
  events: EventRow[];
  selectedDate: string;
  onDayPress: (date: string) => void;
  onMonthChange: (date: Date) => void;
}

export function MonthlyCalendar({
  events,
  selectedDate,
  onDayPress,
  onMonthChange,
}: MonthlyCalendarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  // Build a map of date -> events with span position info
  const eventsByDate = useMemo(() => {
    const map: Record<string, DayEvent[]> = {};
    for (const event of events) {
      const s = new Date(event.start_at);
      const e = new Date(event.end_at);
      const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const endDay = new Date(e.getFullYear(), e.getMonth(), e.getDate());
      const isMultiDay = startDay.getTime() !== endDay.getTime();

      const cursor = new Date(startDay);
      while (cursor <= endDay) {
        const dateKey = toDateString(cursor);
        if (!map[dateKey]) map[dateKey] = [];

        let position: SpanPosition = "single";
        if (isMultiDay) {
          const ct = cursor.getTime();
          if (ct === startDay.getTime()) position = "start";
          else if (ct === endDay.getTime()) position = "end";
          else position = "middle";
        }

        map[dateKey].push({ event, position });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const handleMonthChange = useCallback(
    (year: number, month: number) => {
      onMonthChange(new Date(year, month - 1, 1));
    },
    [onMonthChange]
  );

  const renderDay = useCallback(
    (info: DayInfo) => {
      const { dateString, day, dayOfWeek, isOutsideMonth, isToday, isSelected } = info;
      const holidayName = getHolidayName(dateString);
      const isHoliday = !!holidayName;
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const dayEvents = eventsByDate[dateString] ?? EMPTY_EVENTS;

      let textColor: string = colors.text;
      if (isOutsideMonth) {
        textColor = colors.border;
      } else if (isHoliday || isSunday) {
        textColor = "#D32F2F";
      } else if (isSaturday) {
        textColor = "#1976D2";
      }

      return (
        <View
          style={[
            styles.dayContainer,
            isToday && styles.todayContainer,
            isSelected && { backgroundColor: colors.primaryLight },
          ]}
        >
          <View style={styles.dayHeader}>
            <View
              style={[
                styles.dayCircle,
                isToday && { backgroundColor: "#D32F2F" },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isToday ? "#FFFFFF" : textColor },
                ]}
              >
                {day}
              </Text>
            </View>
          </View>
          {isHoliday && !isOutsideMonth && (
            <Text style={styles.holidayText} numberOfLines={1}>
              {holidayName}
            </Text>
          )}
          <View style={styles.eventsContainer}>
            {dayEvents.slice(0, 3).map((de) => {
              const bgColor = (de.event as any).color || colors.primary;
              const pos = de.position;
              return (
                <View
                  key={de.event.id}
                  accessible={true}
                  accessibilityLabel={de.event.title}
                  style={[
                    styles.eventBadge,
                    { backgroundColor: bgColor },
                    pos === "start" && styles.badgeStart,
                    pos === "middle" && styles.badgeMiddle,
                    pos === "end" && styles.badgeEnd,
                  ]}
                >
                  {(pos === "single" || pos === "start") ? (
                    <Text style={styles.eventBadgeText} numberOfLines={1}>
                      {de.event.title}
                    </Text>
                  ) : (
                    <Text style={styles.eventBadgeText}>{" "}</Text>
                  )}
                </View>
              );
            })}
            {dayEvents.length > 3 && (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                +{dayEvents.length - 3}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [eventsByDate, colors]
  );

  const renderMonthHeader = useCallback(
    (year: number, month: number) => (
      <Text style={[styles.monthHeader, { color: colors.text }]}>
        {year}年{month}月
      </Text>
    ),
    [colors.text]
  );

  return (
    <CalendarList
      current={selectedDate}
      selectedDate={selectedDate}
      pastMonths={120}
      futureMonths={600}
      onDayPress={onDayPress}
      onMonthChange={handleMonthChange}
      renderDay={renderDay}
      renderMonthHeader={renderMonthHeader}
      dayOfWeekLabels={DOW_LABELS}
      theme={{
        backgroundColor: colors.background,
        dayOfWeekColors: ["#D32F2F", undefined, undefined, undefined, undefined, undefined, "#1976D2"],
        monthHeaderStyle: { color: colors.text },
        dayOfWeekHeaderStyle: { color: colors.textSecondary },
      }}
    />
  );
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMPTY_EVENTS: DayEvent[] = [];

const styles = StyleSheet.create({
  dayContainer: {
    width: "100%",
    flex: 1,
    paddingVertical: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  todayContainer: {
    backgroundColor: "rgba(211, 47, 47, 0.06)",
    borderLeftWidth: 3,
    borderLeftColor: "#D32F2F",
  },
  dayHeader: {
    alignItems: "center",
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  holidayText: {
    fontSize: 9,
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 1,
  },
  eventsContainer: {
    marginTop: 2,
    gap: 2,
  },
  eventBadge: {
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  badgeStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 0,
  },
  badgeMiddle: {
    borderRadius: 0,
    marginHorizontal: 0,
  },
  badgeEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: 0,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  moreText: {
    fontSize: 10,
    textAlign: "center",
  },
  monthHeader: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    paddingVertical: 10,
    textAlign: "center",
  },
});
