import { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getMonthGrid, toDateString, getToday } from "./utils";
import type { DayInfo, CalendarTheme } from "./types";
import type { ReactNode } from "react";

interface MonthViewProps {
  year: number;
  month: number;
  selectedDate: string;
  monthHeight: number;
  onDayPress?: (dateString: string) => void;
  renderDay?: (info: DayInfo) => ReactNode;
  renderMonthHeader?: (year: number, month: number) => ReactNode;
  dayOfWeekLabels: string[];
  theme?: CalendarTheme;
}

export const MonthView = memo(function MonthView({
  year,
  month,
  selectedDate,
  monthHeight,
  onDayPress,
  renderDay,
  renderMonthHeader,
  dayOfWeekLabels,
  theme,
}: MonthViewProps) {
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);
  const today = getToday();
  const cellHeight = Math.floor((monthHeight - 60) / 6); // 60px for header + dow

  return (
    <View style={[styles.container, { height: monthHeight, backgroundColor: theme?.backgroundColor }]}>
      {/* Month header */}
      {renderMonthHeader ? (
        renderMonthHeader(year, month)
      ) : (
        <Text style={[styles.monthHeader, theme?.monthHeaderStyle]}>
          {year}年{month}月
        </Text>
      )}

      {/* Day of week header */}
      <View style={styles.dowRow}>
        {dayOfWeekLabels.map((label, i) => (
          <View key={i} style={styles.dowCell}>
            <Text
              style={[
                styles.dowText,
                theme?.dayOfWeekHeaderStyle,
                theme?.dayOfWeekColors?.[i] ? { color: theme.dayOfWeekColors[i] } : undefined,
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid: 6 rows × 7 columns */}
      {Array.from({ length: 6 }, (_, row) => (
        <View key={row} style={[styles.weekRow, { height: cellHeight }]}>
          {grid.slice(row * 7, row * 7 + 7).map((date) => {
            const dateString = toDateString(date);
            const info: DayInfo = {
              dateString,
              day: date.getDate(),
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              dayOfWeek: date.getDay(),
              isOutsideMonth: date.getMonth() + 1 !== month,
              isToday: dateString === today,
              isSelected: dateString === selectedDate,
            };

            if (renderDay) {
              const custom = renderDay(info);
              if (custom !== null) {
                return (
                  <TouchableOpacity
                    key={dateString}
                    style={styles.dayCell}
                    onPress={() => onDayPress?.(dateString)}
                    activeOpacity={0.6}
                    accessibilityLabel={info.isOutsideMonth ? undefined : `day-${dateString}`}
                  >
                    {custom}
                  </TouchableOpacity>
                );
              }
            }

            // Default day cell
            return (
              <DayCell
                key={dateString}
                info={info}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

interface DayCellProps {
  info: DayInfo;
  onPress?: (dateString: string) => void;
}

const DayCell = memo(function DayCell({ info, onPress }: DayCellProps) {
  const { dateString, day, isOutsideMonth, isToday, isSelected } = info;

  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        isSelected && styles.selectedCell,
      ]}
      onPress={() => onPress?.(dateString)}
      activeOpacity={0.6}
      accessibilityLabel={isOutsideMonth ? undefined : `day-${dateString}`}
    >
      <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
        <Text
          style={[
            styles.dayText,
            isOutsideMonth && styles.outsideText,
            isToday && styles.todayText,
          ]}
        >
          {day}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
  },
  dowRow: {
    flexDirection: "row",
    height: 24,
  },
  dowCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dowText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingTop: 2,
  },
  selectedCell: {
    backgroundColor: "rgba(32, 138, 239, 0.1)",
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    backgroundColor: "#D32F2F",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  outsideText: {
    color: "#CCC",
  },
  todayText: {
    color: "#FFF",
  },
});
