import { useMemo } from "react";
import { Calendar, type DateData } from "react-native-calendars";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, FontSize } from "@/constants/theme";
import { CATEGORY_CONFIG } from "@/constants/categories";
import type { EventRow, EventCategory } from "@/types/events";
import { toDateString } from "@/utils/date";

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

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    for (const event of events) {
      const dateKey = toDateString(new Date(event.start_at));
      if (!marks[dateKey]) {
        marks[dateKey] = { dots: [] };
      }
      const category = event.category as EventCategory;
      const categoryColor = CATEGORY_CONFIG[category]?.color ?? colors.primary;
      const alreadyHasColor = marks[dateKey].dots.some(
        (d: any) => d.color === categoryColor
      );
      if (!alreadyHasColor && marks[dateKey].dots.length < 4) {
        marks[dateKey].dots.push({
          key: event.id,
          color: categoryColor,
        });
      }
    }

    // Add selected date styling
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };

    return marks;
  }, [events, selectedDate, colors.primary]);

  return (
    <Calendar
      current={selectedDate}
      onDayPress={(day: DateData) => onDayPress(day.dateString)}
      onMonthChange={(month: DateData) =>
        onMonthChange(new Date(month.year, month.month - 1, 1))
      }
      markingType="multi-dot"
      markedDates={markedDates}
      theme={{
        backgroundColor: colors.background,
        calendarBackground: colors.background,
        textSectionTitleColor: colors.textSecondary,
        selectedDayBackgroundColor: colors.primary,
        selectedDayTextColor: "#FFFFFF",
        todayTextColor: colors.primary,
        dayTextColor: colors.text,
        textDisabledColor: colors.border,
        monthTextColor: colors.text,
        textMonthFontWeight: "bold",
        textMonthFontSize: FontSize.lg,
        textDayFontSize: FontSize.md,
        textDayHeaderFontSize: FontSize.sm,
        arrowColor: colors.primary,
      }}
    />
  );
}
