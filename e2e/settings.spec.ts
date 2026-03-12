import { test, expect } from "@playwright/test";
import { setupTestUser, injectSession } from "./helpers";

let session: Awaited<ReturnType<typeof setupTestUser>>;

test.beforeAll(async () => {
  session = await setupTestUser();
});

test.beforeEach(async ({ page }) => {
  await injectSession(page, session.accessToken, session.refreshToken);
  // ホーム画面が表示されるまで待つ
  await expect(page.getByText(/さん|Home/)).toBeVisible({ timeout: 10000 });
});

/**
 * 入力欄のフォーカスを外すヘルパー
 */
async function blurActiveInput(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
  });
  await page.waitForTimeout(200);
}

// ============================================================
// 設定画面アクセス
// ============================================================

test("ホーム画面の歯車アイコンから設定画面に遷移できる", async ({ page }) => {
  // 歯車アイコンをクリック
  await page.locator('[data-testid="settings-icon"]').click();

  // 設定画面タイトルの表示を待つ（フォールバック: URLベースの確認）
  await expect(
    page.getByText(/^設定$|^Settings$/)
  ).toBeVisible({ timeout: 10000 });
});

test("設定画面から戻るボタンでホーム画面に戻れる", async ({ page }) => {
  // 設定画面に遷移
  await page.locator('[data-testid="settings-icon"]').click();

  await expect(page.getByText(/^設定$|^Settings$/)).toBeVisible({ timeout: 10000 });

  // 戻るボタンをクリック
  await page.locator('[data-testid="back-button"]').click();

  // ホーム画面に戻っていることを確認
  await expect(page.getByText(/さん|Home/)).toBeVisible({ timeout: 10000 });
});

// ============================================================
// プロフィール編集
// ============================================================

test("設定画面でプロフィール（表示名）を編集できる", async ({ page }) => {
  // 設定画面に遷移
  await page.locator('[data-testid="settings-icon"]').click();
  await expect(page.getByText(/^設定$|^Settings$/)).toBeVisible({ timeout: 10000 });

  // プロフィールセクションが表示されていることを確認
  await expect(page.getByText(/プロフィール|Profile/).first()).toBeVisible();

  // 表示名の入力欄を探す（「表示名」ラベルの後の input）
  const nameInput = page.locator('input').first();
  await expect(nameInput).toBeVisible();

  // 表示名を変更
  await nameInput.clear();
  await nameInput.fill("テスト太郎更新");

  await blurActiveInput(page);

  // 保存ボタンをクリック
  const saveButton = page.getByText(/^保存$|^Save$/).first();
  await saveButton.click();

  // 「保存しました」メッセージの確認
  await expect(page.getByText(/保存しました|Saved/)).toBeVisible({ timeout: 5000 });

  // 元の名前に戻す
  await nameInput.clear();
  await nameInput.fill("テスト太郎");
  await blurActiveInput(page);
  await saveButton.click();
  await expect(page.getByText(/保存しました|Saved/)).toBeVisible({ timeout: 5000 });
});

// ============================================================
// 家族招待セクション
// ============================================================

test("設定画面に家族招待セクションが表示される", async ({ page }) => {
  // 設定画面に遷移
  await page.locator('[data-testid="settings-icon"]').click();
  await expect(page.getByText(/^設定$|^Settings$/)).toBeVisible({ timeout: 10000 });

  // 家族招待セクションが表示されていることを確認
  await expect(page.getByText(/家族を招待|Invite Family/).first()).toBeVisible();

  // メールアドレス入力欄があること（2番目のinput = 招待メール入力欄）
  const emailInput = page.locator('input').nth(1);
  await expect(emailInput).toBeVisible();
});

// ============================================================
// ログアウト
// ============================================================

test("設定画面からログアウトできる", async ({ page }) => {
  // 設定画面に遷移
  await page.locator('[data-testid="settings-icon"]').click();

  await expect(page.getByText(/^設定$|^Settings$/)).toBeVisible({ timeout: 10000 });

  // ログアウトボタンをクリック
  await page.getByText(/ログアウト|Logout|Log out/).click();

  // ログイン画面に遷移することを確認
  await expect(
    page.getByText(/メールアドレス|Email|ログイン|Login/)
  ).toBeVisible({ timeout: 10000 });
});

// ============================================================
// 基本情報の表示名
// ============================================================

test("基本情報テンプレートに表示名フィールドがある", async ({ page }) => {
  // ノートタブに移動
  const notebookTab = page.getByText(/ノート|Notebook/).first();
  await notebookTab.click();
  await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 10000 });

  // 基本情報テンプレートを開く
  await page.getByText(/基本情報|Profile/).click();
  await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

  // 表示名フィールドが存在することを確認
  await expect(page.getByText(/^表示名$|^Display Name$/)).toBeVisible();

  // 氏名フィールドも存在することを確認
  await expect(page.getByText(/^氏名$|^Full Name$/)).toBeVisible();

  // キャンセル
  await page.getByText(/キャンセル|Cancel/).click();
});
