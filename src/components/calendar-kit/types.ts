import type { ReactNode } from "react";
import type { TextStyle, ViewStyle } from "react-native";

/** 各日セルに渡される情報 */
export interface DayInfo {
  /** yyyy-MM-dd */
  dateString: string;
  day: number;
  month: number;
  year: number;
  dayOfWeek: number; // 0=Sun, 6=Sat
  /** 表示中の月と異なる（前月/翌月の日） */
  isOutsideMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarTheme {
  backgroundColor?: string;
  monthHeaderStyle?: TextStyle;
  dayOfWeekHeaderStyle?: TextStyle;
  /** 日〜土のヘッダー色 [0]=日, [6]=土 */
  dayOfWeekColors?: (string | undefined)[];
}

export interface CalendarListProps {
  /** 初期表示日 (yyyy-MM-dd) */
  current?: string;
  /** 選択中の日 (yyyy-MM-dd) */
  selectedDate?: string;
  /** 過去何ヶ月スクロール可能か (default: 120 = 10年) */
  pastMonths?: number;
  /** 未来何ヶ月スクロール可能か (default: 600 = 50年) */
  futureMonths?: number;
  /** 各月の高さ (default: 自動計算) */
  monthHeight?: number;
  /** 日セルタップ */
  onDayPress?: (dateString: string) => void;
  /** 表示中の月が変わった */
  onMonthChange?: (year: number, month: number) => void;
  /** カスタム日セルレンダラー。nullを返すとデフォルト表示 */
  renderDay?: (info: DayInfo) => ReactNode;
  /** カスタム月ヘッダー */
  renderMonthHeader?: (year: number, month: number) => ReactNode;
  /** 曜日ラベル (7要素, [0]=日曜) */
  dayOfWeekLabels?: string[];
  theme?: CalendarTheme;
  style?: ViewStyle;
}
