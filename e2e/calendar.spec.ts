import { test, expect } from "@playwright/test";
import { setupTestUser, injectSession } from "./helpers";

let session: Awaited<ReturnType<typeof setupTestUser>>;

test.beforeAll(async () => {
  session = await setupTestUser();
});

test.beforeEach(async ({ page }) => {
  await injectSession(page, session.accessToken, session.refreshToken);
  // カレンダータブに移動（Web版は英語ラベルの場合あり）
  const calendarTab = page.getByText(/カレンダー|Calendar/);
  await calendarTab.click();
  await expect(page.getByText("Sun").first()).toBeVisible({ timeout: 10000 });
});

/**
 * 予定作成フォームを開き、プロフィールデータの読み込みを待つヘルパー
 */
async function openNewEventForm(page: import("@playwright/test").Page) {
  await page.getByLabel("day-2026-03-10").click();
  await expect(page.getByText("予定を追加")).toBeVisible();
  await page.getByText("予定を追加").click();
  // プロフィール（担当者リスト）が読み込まれるまで待つ
  await expect(page.getByText("テスト太郎")).toBeVisible({ timeout: 10000 });
}

// ============================================================
// 予定作成テスト
// ============================================================

test("基本的な予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("基本テスト予定");

  await page.getByText("保存").click();

  await expect(page.getByText("基本テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("タイトル空白でバリデーションエラーが表示される", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByText("保存").click();

  await expect(page.getByText("タイトルを入力してください")).toBeVisible();

  await page.getByText("キャンセル").click();
});

test("終日予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("終日テスト予定");

  await page.getByText("終日", { exact: true }).click();

  await expect(page.getByText("開始日時")).toBeVisible();
  await expect(page.getByText("終了日時")).toBeVisible();

  await page.getByText("保存").click();
  await expect(page.getByText("終日テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("帯の色を変更できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("赤色テスト予定");

  await page.getByTestId("color-D32F2F").click();

  await page.getByText("保存").click();
  await expect(page.getByText("赤色テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("毎週の繰り返し予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("毎週テスト予定");

  await expect(page.getByText("なし")).toBeVisible();
  await expect(page.getByText("毎日", { exact: true })).toBeVisible();
  await expect(page.getByText("毎週", { exact: true })).toBeVisible();
  await expect(page.getByText("毎月", { exact: true })).toBeVisible();
  await expect(page.getByText("毎年", { exact: true })).toBeVisible();

  await page.getByText("毎週", { exact: true }).click();

  await page.getByText("保存").click();
  await expect(page.getByText("毎週テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("毎月の繰り返し予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("毎月テスト予定");
  await page.getByText("毎月", { exact: true }).click();

  await page.getByText("保存").click();
  await expect(page.getByText("毎月テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("毎年の繰り返し予定（誕生日）を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("誕生日テスト");
  await page.getByText("毎年", { exact: true }).click();
  await page.getByText("終日", { exact: true }).click();

  await page.getByText("保存").click();
  await expect(page.getByText("誕生日テスト").first()).toBeVisible({ timeout: 10000 });
});

test("通知（リマインダー）付き予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("通知テスト予定");

  await page.getByText("30分前").click();
  await page.getByText("1時間前").click();
  await page.getByText("1日前").click();

  await page.getByText("保存").click();
  await expect(page.getByText("通知テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test.skip("担当者を選択した予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("担当者テスト予定");
  await page.getByText("テスト太郎").click();

  await page.getByText("保存").click();
  await expect(page.getByText("担当者テスト予定").first()).toBeVisible({ timeout: 10000 });
});

test("全機能を組み合わせた予定を作成できる", async ({ page }) => {
  await openNewEventForm(page);

  await page.getByPlaceholder("予定のタイトル").fill("フル機能テスト予定");
  await page.getByText("終日", { exact: true }).click();
  await page.getByText("毎月", { exact: true }).click();
  await page.getByText("テスト太郎").click();
  await page.getByText("30分前").click();
  await page.getByText("1日前").click();

  await page.getByPlaceholder("メモを入力").fill("E2Eテスト用のフル機能テスト");

  await page.getByText("保存").click();
  await expect(page.getByText("フル機能テスト予定").first()).toBeVisible({ timeout: 10000 });
});

// ============================================================
// カレンダーナビゲーションテスト
// ============================================================

test("日付指定ジャンプが動作する", async ({ page }) => {
  await page.getByLabel("日付を指定").click();
  await expect(page.getByText("日付を指定")).toBeVisible();
  await page.getByText("OK").click();
});

// ============================================================
// ボトムシートからイベント詳細への遷移
// ============================================================

test.skip("ボトムシートからイベント詳細に遷移できる", async ({ page }) => {
  // まず予定を作成
  await openNewEventForm(page);
  await page.getByPlaceholder("予定のタイトル").fill("詳細遷移テスト");
  await page.getByText("保存").click();
  await expect(page.getByText("詳細遷移テスト").first()).toBeVisible({ timeout: 10000 });

  // 日付タップでボトムシート表示
  await page.getByLabel("day-2026-03-10").click();
  await expect(page.getByText("詳細遷移テスト").first()).toBeVisible();

  // ボトムシート内のイベントカードをタップ
  await page.getByText("詳細遷移テスト").first().click();

  // 詳細画面が表示される
  await expect(page.getByText("詳細遷移テスト").first()).toBeVisible({ timeout: 10000 });
});
