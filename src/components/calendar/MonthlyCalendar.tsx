import { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { CalendarList, type DateData } from "react-native-calendars";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, FontSize } from "@/constants/theme";
import type { EventRow } from "@/types/events";
import { toDateString } from "@/utils/date";
import { getHolidayMap } from "@/constants/holidays";

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
  const { height: screenHeight } = useWindowDimensions();

  const calendarHeight = Math.max(380, screenHeight - 150);
  const cellMinHeight = Math.max(52, Math.floor((calendarHeight - 60) / 6));

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

  // Cache holiday maps for visible years
  const holidayMaps = useMemo(() => {
    const now = new Date();
    const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
    const map = new Map<number, Map<string, string>>();
    for (const y of years) {
      map.set(y, getHolidayMap(y));
    }
    return map;
  }, []);

  const getHolidayName = useCallback(
    (dateStr: string): string | undefined => {
      const year = parseInt(dateStr.substring(0, 4));
      let hmap = holidayMaps.get(year);
      if (!hmap) {
        hmap = getHolidayMap(year);
        holidayMaps.set(year, hmap);
      }
      return hmap.get(dateStr);
    },
    [holidayMaps]
  );

  const today = toDateString(new Date());

  return (
    <CalendarList
      current={selectedDate}
      onDayPress={(day: DateData) => onDayPress(day.dateString)}
      onVisibleMonthsChange={(months: DateData[]) => {
        if (months.length > 0) {
          const m = months[0];
          onMonthChange(new Date(m.year, m.month - 1, 1));
        }
      }}
      pastScrollRange={24}
      futureScrollRange={60}
      scrollEnabled
      showScrollIndicator={false}
      calendarHeight={calendarHeight}
      dayComponent={({ date, state }: any) => {
        if (!date) return <View style={styles.dayContainer} />;
        const dateStr: string = date.dateString;
        const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
        const holidayName = getHolidayName(dateStr);
        const isHoliday = !!holidayName;
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        const isSelected = dateStr === selectedDate;
        const isDisabled = state === "disabled";
        const isToday = dateStr === today;
        const dayEvents = eventsByDate[dateStr] ?? [];

        let textColor: string = colors.text;
        if (isDisabled) {
          textColor = colors.border;
        } else if (isHoliday || isSunday) {
          textColor = "#D32F2F";
        } else if (isSaturday) {
          textColor = "#1976D2";
        }

        return (
          <TouchableOpacity
            onPress={() => onDayPress(dateStr)}
            accessibilityLabel={`day-${dateStr}`}
            style={[
              styles.dayContainer,
              { minHeight: cellMinHeight },
              isToday && styles.todayContainer,
              isSelected && { backgroundColor: colors.primaryLight },
            ]}
            activeOpacity={0.6}
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
                  {date.day}
                </Text>
              </View>
            </View>
            {isHoliday && !isDisabled && (
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
                <Text
                  style={[styles.moreText, { color: colors.textSecondary }]}
                >
                  +{dayEvents.length - 3}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      theme={{
        backgroundColor: colors.background,
        calendarBackground: colors.background,
        textSectionTitleColor: colors.textSecondary,
        monthTextColor: colors.text,
        textMonthFontWeight: "bold",
        textMonthFontSize: FontSize.lg,
        textDayHeaderFontSize: FontSize.md,
        arrowColor: colors.primary,
        // @ts-ignore — react-native-calendars supports stylesheet overrides
        "stylesheet.calendar.header": {
          dayTextAtIndex0: { color: "#D32F2F" },
          dayTextAtIndex6: { color: "#1976D2" },
        },
      }}
      renderHeader={(date: any) => {
        const d = typeof date === "string" ? new Date(date) : date;
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        return (
          <Text style={[styles.monthHeader, { color: colors.text }]}>
            {year}年{month}月
          </Text>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    width: "100%",
    minHeight: 52,
    paddingVertical: 3,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
    borderLeftWidth: 0,
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
  // Default badge: single-day event, rounded on all sides
  eventBadge: {
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  // Start of multi-day: rounded left, flat right, extend to right edge
  badgeStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 0,
  },
  // Middle of multi-day: flat both sides, extend full width
  badgeMiddle: {
    borderRadius: 0,
    marginHorizontal: 0,
  },
  // End of multi-day: flat left, rounded right, extend from left edge
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
  },
});
