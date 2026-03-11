/**
 * 日本の祝日を計算するユーティリティ
 * 固定祝日 + ハッピーマンデー + 春分/秋分の日
 *
 * 固定祝日データは内閣府CSVと同期可能:
 *   bun run scripts/sync-holidays.ts
 *
 * GitHub Actions でも毎月自動チェック (.github/workflows/sync-holidays.yml)
 */

interface Holiday {
  date: string; // yyyy-MM-dd
  name: string;
}

/** 固定祝日 (month は 1-indexed) */
const FIXED_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "元日" },
  { month: 2, day: 11, name: "建国記念の日" },
  { month: 2, day: 23, name: "天皇誕生日" },
  { month: 4, day: 29, name: "昭和の日" },
  { month: 5, day: 3, name: "憲法記念日" },
  { month: 5, day: 4, name: "みどりの日" },
  { month: 5, day: 5, name: "こどもの日" },
  { month: 8, day: 11, name: "山の日" },
  { month: 11, day: 3, name: "文化の日" },
  { month: 11, day: 23, name: "勤労感謝の日" },
];

/** ハッピーマンデー (第n月曜日) */
const HAPPY_MONDAY: {
  month: number;
  week: number;
  name: string;
}[] = [
  { month: 1, week: 2, name: "成人の日" },
  { month: 7, week: 3, name: "海の日" },
  { month: 9, week: 3, name: "敬老の日" },
  { month: 10, week: 2, name: "スポーツの日" },
];

/** 第n月曜日の日付を取得 */
function getNthMonday(year: number, month: number, n: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const firstMonday = firstDay <= 1 ? 2 - firstDay : 9 - firstDay;
  return firstMonday + (n - 1) * 7;
}

/** 春分の日の近似計算 */
function getVernalEquinox(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

/** 秋分の日の近似計算 */
function getAutumnalEquinox(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 指定年の祝日一覧を返す */
export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // 固定祝日
  for (const h of FIXED_HOLIDAYS) {
    holidays.push({
      date: `${year}-${pad(h.month)}-${pad(h.day)}`,
      name: h.name,
    });
  }

  // ハッピーマンデー
  for (const h of HAPPY_MONDAY) {
    const day = getNthMonday(year, h.month, h.week);
    holidays.push({
      date: `${year}-${pad(h.month)}-${pad(day)}`,
      name: h.name,
    });
  }

  // 春分の日
  const vernal = getVernalEquinox(year);
  holidays.push({
    date: `${year}-03-${pad(vernal)}`,
    name: "春分の日",
  });

  // 秋分の日
  const autumnal = getAutumnalEquinox(year);
  holidays.push({
    date: `${year}-09-${pad(autumnal)}`,
    name: "秋分の日",
  });

  // 振替休日: 祝日が日曜の場合、翌月曜が振替休日
  const holidayDates = new Set(holidays.map((h) => h.date));
  const substitutes: Holiday[] = [];
  for (const h of holidays) {
    const d = new Date(h.date + "T00:00:00");
    if (d.getDay() === 0) {
      // 日曜日
      let next = new Date(d);
      next.setDate(next.getDate() + 1);
      let nextStr = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
      // 翌日も祝日なら更に翌日
      while (holidayDates.has(nextStr)) {
        next.setDate(next.getDate() + 1);
        nextStr = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
      }
      substitutes.push({ date: nextStr, name: "振替休日" });
      holidayDates.add(nextStr);
    }
  }

  // 国民の休日: 祝日と祝日に挟まれた平日
  const allDates = [...holidays, ...substitutes].map((h) => h.date).sort();
  for (let i = 0; i < allDates.length - 1; i++) {
    const d1 = new Date(allDates[i] + "T00:00:00");
    const d2 = new Date(allDates[i + 1] + "T00:00:00");
    const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 2) {
      const between = new Date(d1);
      between.setDate(between.getDate() + 1);
      const betweenStr = `${between.getFullYear()}-${pad(between.getMonth() + 1)}-${pad(between.getDate())}`;
      if (!holidayDates.has(betweenStr) && between.getDay() !== 0) {
        substitutes.push({ date: betweenStr, name: "国民の休日" });
      }
    }
  }

  return [...holidays, ...substitutes].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/** モジュールレベルキャッシュ */
const holidayMapCache = new Map<number, Map<string, string>>();

/** 指定年の祝日を日付→名前のMapで返す（キャッシュ付き） */
export function getHolidayMap(year: number): Map<string, string> {
  const cached = holidayMapCache.get(year);
  if (cached) return cached;
  const map = new Map<string, string>();
  for (const h of getHolidaysForYear(year)) {
    map.set(h.date, h.name);
  }
  holidayMapCache.set(year, map);
  return map;
}

/** 日付文字列から祝日名を取得（キャッシュ付き） */
export function getHolidayName(dateStr: string): string | undefined {
  const year = parseInt(dateStr.substring(0, 4));
  return getHolidayMap(year).get(dateStr);
}
