/**
 * 内閣府の祝日CSVを取得し、holidays.ts の固定祝日データと比較・更新するスクリプト
 *
 * 使い方: bun run scripts/sync-holidays.ts
 *
 * 内閣府CSV: https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv
 * フォーマット: "国民の祝日・休日月日","国民の祝日・休日名称"
 *              "1955/1/1","元日"
 */

import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";

const CSV_URL = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";
const HOLIDAYS_FILE = path.join(
  __dirname,
  "..",
  "src",
  "constants",
  "holidays.ts"
);

interface HolidayEntry {
  date: string; // yyyy/M/d
  name: string;
}

async function fetchCSV(): Promise<string> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return iconv.decode(buffer, "Shift_JIS");
}

function parseCSV(csv: string): HolidayEntry[] {
  const lines = csv.split("\n").slice(1); // skip header
  const entries: HolidayEntry[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Format: "yyyy/M/d","name" or yyyy/M/d,name
    const match = trimmed.match(
      /^"?(\d{4}\/\d{1,2}\/\d{1,2})"?,\s*"?([^"]*)"?$/
    );
    if (match) {
      entries.push({ date: match[1], name: match[2].trim() });
    }
  }
  return entries;
}

// 既知の計算可能な祝日（ハッピーマンデー、春分、秋分、振替休日、国民の休日）
const COMPUTED_HOLIDAYS = new Set([
  "成人の日",
  "春分の日",
  "秋分の日",
  "海の日",
  "敬老の日",
  "スポーツの日",
  "体育の日", // 旧名
  "振替休日",
  "休日", // 国民の休日
]);

interface FixedHoliday {
  month: number;
  day: number;
  name: string;
}

function extractFixedHolidays(entries: HolidayEntry[]): FixedHoliday[] {
  // 直近3年のデータから固定祝日パターンを抽出
  const currentYear = new Date().getFullYear();
  const recentEntries = entries.filter((e) => {
    const year = parseInt(e.date.split("/")[0]);
    return year >= currentYear && year <= currentYear + 2;
  });

  // 固定祝日 = 毎年同じ月日に発生する祝日
  // 計算可能な祝日を除外
  const candidates = new Map<string, { month: number; day: number; name: string; count: number }>();

  for (const entry of recentEntries) {
    if (COMPUTED_HOLIDAYS.has(entry.name)) continue;

    const parts = entry.date.split("/");
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const key = `${month}-${day}-${entry.name}`;

    const existing = candidates.get(key);
    if (existing) {
      existing.count++;
    } else {
      candidates.set(key, { month, day, name: entry.name, count: 1 });
    }
  }

  // 複数年で同じ月日に出現するものだけを固定祝日とする (1回でも含める、CSVが将来分を含むため)
  return Array.from(candidates.values())
    .map(({ month, day, name }) => ({ month, day, name }))
    .sort((a, b) => a.month * 100 + a.day - (b.month * 100 + b.day));
}

function generateFixedHolidaysCode(holidays: FixedHoliday[]): string {
  const lines = holidays.map(
    (h) => `  { month: ${h.month}, day: ${h.day}, name: "${h.name}" },`
  );
  return lines.join("\n");
}

function updateHolidaysFile(newFixedCode: string): boolean {
  const content = fs.readFileSync(HOLIDAYS_FILE, "utf-8");

  // Extract current FIXED_HOLIDAYS block
  const regex =
    /const FIXED_HOLIDAYS: \{ month: number; day: number; name: string \}\[\] = \[\n([\s\S]*?)\];/;
  const match = content.match(regex);
  if (!match) {
    console.error("Could not find FIXED_HOLIDAYS in holidays.ts");
    return false;
  }

  const currentCode = match[1].trim();
  const newCode = newFixedCode.trim();

  if (currentCode === newCode) {
    console.log("✅ No changes detected. holidays.ts is up to date.");
    return false;
  }

  console.log("📝 Changes detected! Updating holidays.ts...");
  console.log("\n--- Current ---");
  console.log(currentCode);
  console.log("\n--- New ---");
  console.log(newCode);

  const updated = content.replace(
    regex,
    `const FIXED_HOLIDAYS: { month: number; day: number; name: string }[] = [\n${newFixedCode}\n];`
  );
  fs.writeFileSync(HOLIDAYS_FILE, updated, "utf-8");
  console.log("\n✅ holidays.ts updated successfully.");
  return true;
}

async function main() {
  console.log("🔄 Fetching holidays CSV from Cabinet Office...");
  const csv = await fetchCSV();
  const entries = parseCSV(csv);
  console.log(`📋 Parsed ${entries.length} holiday entries.`);

  const fixedHolidays = extractFixedHolidays(entries);
  console.log(`📌 Found ${fixedHolidays.length} fixed holidays.`);

  for (const h of fixedHolidays) {
    console.log(`  ${h.month}/${h.day} ${h.name}`);
  }

  const newCode = generateFixedHolidaysCode(fixedHolidays);
  const changed = updateHolidaysFile(newCode);

  if (!changed) {
    console.log("🎉 No update needed.");
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
