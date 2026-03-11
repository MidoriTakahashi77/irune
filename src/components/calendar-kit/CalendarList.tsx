import { useCallback, useRef, useMemo } from "react";
import {
  FlatList,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItemInfo,
} from "react-native";
import { MonthView } from "./MonthView";
import { indexToYearMonth, yearMonthToIndex } from "./utils";
import type { CalendarListProps } from "./types";

const DEFAULT_PAST_MONTHS = 120; // 10年
const DEFAULT_FUTURE_MONTHS = 600; // 50年
const DEFAULT_DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarList({
  current,
  selectedDate,
  pastMonths = DEFAULT_PAST_MONTHS,
  futureMonths = DEFAULT_FUTURE_MONTHS,
  monthHeight: monthHeightProp,
  onDayPress,
  onMonthChange,
  renderDay,
  renderMonthHeader,
  dayOfWeekLabels = DEFAULT_DOW_LABELS,
  theme,
  style,
}: CalendarListProps) {
  const { height: screenHeight } = useWindowDimensions();
  const monthHeight = monthHeightProp ?? Math.max(380, screenHeight - 150);
  const flatListRef = useRef<FlatList>(null);

  const totalMonths = pastMonths + futureMonths + 1;

  // Base (list origin) は初回マウント時に固定。current が変わっても再計算しない。
  const baseRef = useRef<{ year: number; month: number } | null>(null);
  if (baseRef.current === null) {
    const now = current ? new Date(current + "T00:00:00") : new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const totalBase = y * 12 + (m - 1) - pastMonths;
    baseRef.current = {
      year: Math.floor(totalBase / 12),
      month: (totalBase % 12) + 1,
    };
  }
  const baseYear = baseRef.current.year;
  const baseMonth = baseRef.current.month;

  const initialIndex = useMemo(
    () => {
      const now = current ? new Date(current + "T00:00:00") : new Date();
      return yearMonthToIndex(baseYear, baseMonth, now.getFullYear(), now.getMonth() + 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only compute once
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: monthHeight,
      offset: monthHeight * index,
      index,
    }),
    [monthHeight]
  );

  // renderItem は selectedDate の変更で再生成されるが、
  // baseYear/baseMonth は固定なので FlatList の data は不変。
  const renderItem = useCallback(
    ({ index }: ListRenderItemInfo<number>) => {
      const { year, month } = indexToYearMonth(baseYear, baseMonth, index);
      return (
        <MonthView
          year={year}
          month={month}
          selectedDate={selectedDate ?? ""}
          monthHeight={monthHeight}
          onDayPress={onDayPress}
          renderDay={renderDay}
          renderMonthHeader={renderMonthHeader}
          dayOfWeekLabels={dayOfWeekLabels}
          theme={theme}
        />
      );
    },
    [baseYear, baseMonth, selectedDate, monthHeight, onDayPress, renderDay, renderMonthHeader, dayOfWeekLabels, theme]
  );

  // スクロール位置から表示中の月を計算
  const lastReportedIndex = useRef(-1);
  const onMonthChangeRef = useRef(onMonthChange);
  onMonthChangeRef.current = onMonthChange;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.floor((offsetY + monthHeight / 3) / monthHeight);
      if (index !== lastReportedIndex.current && index >= 0 && index < totalMonths) {
        lastReportedIndex.current = index;
        const { year, month } = indexToYearMonth(baseYear, baseMonth, index);
        onMonthChangeRef.current?.(year, month);
      }
    },
    [monthHeight, totalMonths, baseYear, baseMonth]
  );

  // data は固定（totalMonths が変わらない限り不変）
  const data = useMemo(
    () => Array.from({ length: totalMonths }, (_, i) => i),
    [totalMonths]
  );

  const keyExtractor = useCallback((item: number) => String(item), []);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialIndex}
      onScroll={handleScroll}
      scrollEventThrottle={100}
      windowSize={3}
      maxToRenderPerBatch={2}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      style={style}
    />
  );
}
