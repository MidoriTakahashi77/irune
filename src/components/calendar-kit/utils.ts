/** 月のインデックス(0-based)から年・月(1-based)を計算 */
export function indexToYearMonth(
  baseYear: number,
  baseMonth: number,
  index: number
): { year: number; month: number } {
  const totalMonths = baseYear * 12 + (baseMonth - 1) + index;
  return {
    year: Math.floor(totalMonths / 12),
    month: (totalMonths % 12) + 1,
  };
}

/** 年・月からインデックスを計算 */
export function yearMonthToIndex(
  baseYear: number,
  baseMonth: number,
  year: number,
  month: number
): number {
  return (year * 12 + (month - 1)) - (baseYear * 12 + (baseMonth - 1));
}

/** 月のカレンダーグリッド用日付配列を生成 (42要素 = 6週) */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const gridStart = new Date(year, month - 1, 1 - startOffset);

  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return grid;
}

/** Date → yyyy-MM-dd */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 今日の yyyy-MM-dd (キャッシュ) */
let todayCache: string = "";
let todayCacheTime = 0;

export function getToday(): string {
  const now = Date.now();
  // 1分ごとに更新
  if (now - todayCacheTime > 60000) {
    todayCache = toDateString(new Date(now));
    todayCacheTime = now;
  }
  return todayCache;
}
