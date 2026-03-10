import { format, parseISO, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(date: string | Date, fmt: string = "yyyy/MM/dd") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: ja });
}

export function formatTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm", { locale: ja });
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy/MM/dd HH:mm", { locale: ja });
}

export function isSameDayCheck(date1: string | Date, date2: string | Date) {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

export function getMonthRange(date: Date) {
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString(),
  };
}

export function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}
