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

  // Base: the earliest month in the list
  const now = current ? new Date(current + "T00:00:00") : new Date();
  const baseYear = now.getFullYear() - Math.floor(pastMonths / 12);
  const baseMonth = ((now.getMonth() + 1) - (pastMonths % 12) + 12 - 1) % 12 + 1;

  const totalMonths = pastMonths + futureMonths + 1;

  const initialIndex = useMemo(
    () => yearMonthToIndex(baseYear, baseMonth, now.getFullYear(), now.getMonth() + 1),
    [baseYear, baseMonth]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: monthHeight,
      offset: monthHeight * index,
      index,
    }),
    [monthHeight]
  );

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

  // スクロール位置から表示中の月を計算（onViewableItemsChangedより安定）
  const lastReportedIndex = useRef(-1);
  const onMonthChangeRef = useRef(onMonthChange);
  onMonthChangeRef.current = onMonthChange;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      // 画面の上端から1/3地点にある月を「表示中」とする
      const index = Math.floor((offsetY + monthHeight / 3) / monthHeight);
      if (index !== lastReportedIndex.current && index >= 0 && index < totalMonths) {
        lastReportedIndex.current = index;
        const { year, month } = indexToYearMonth(baseYear, baseMonth, index);
        onMonthChangeRef.current?.(year, month);
      }
    },
    [monthHeight, totalMonths, baseYear, baseMonth]
  );

  // Data is just an array of indices
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
