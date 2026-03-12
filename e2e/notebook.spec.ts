import { test, expect } from "@playwright/test";
import { setupTestUser, injectSession } from "./helpers";

let session: Awaited<ReturnType<typeof setupTestUser>>;

test.beforeAll(async () => {
  session = await setupTestUser();
});

test.beforeEach(async ({ page }) => {
  await injectSession(page, session.accessToken, session.refreshToken);
  // ノートタブに移動
  const notebookTab = page.getByText(/ノート|Notebook/).first();
  await notebookTab.click();
  await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 10000 });
});

/**
 * 入力欄のフォーカスを外すヘルパー
 * React Native Web の TouchableOpacity は、フォーカスがある入力欄から
 * 直接ボタンをクリックすると最初のタップでブラー処理が走り、
 * onPress が発火しないことがある
 */
async function blurActiveInput(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
  });
  await page.waitForTimeout(200);
}

// ============================================================
// ライフノートテスト
// ============================================================

test("ライフノートのテンプレートグリッドが表示される", async ({ page }) => {
  await expect(page.getByText(/基本情報|Profile/)).toBeVisible();
  await expect(page.getByText(/医療情報|Medical/)).toBeVisible();
});

test("ライフノートのテンプレートフォームを開ける", async ({ page }) => {
  await page.getByText(/基本情報|Profile/).click();

  await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/キャンセル|Cancel/)).toBeVisible();

  await page.getByText(/キャンセル|Cancel/).click();
  await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 5000 });
});

// ============================================================
// 人生記録タイムラインテスト（順序依存のため serial）
// ============================================================

test.describe("人生記録タイムライン", () => {
  test("年表エントリを追加できる", async ({ page }) => {
    await page.getByText(/人生記録|Life History/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 「追加する」ボタンでエントリを追加
    await page.getByText(/追加する|Add/).click();

    // 編集カードが展開され、入力フィールドが表示される
    await expect(page.getByPlaceholder(/例: 1975|e\.g\. 1975/)).toBeVisible({ timeout: 3000 });
    await expect(page.getByPlaceholder(/例: 結婚|e\.g\./)).toBeVisible();
  });

  test("年・タイトル・詳細を入力して保存できる", async ({ page }) => {
    await page.getByText(/人生記録|Life History/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // エントリを追加して入力
    await page.getByText(/追加する|Add/).click();
    await page.getByPlaceholder(/例: 1975|e\.g\. 1975/).fill("2000");
    await page.getByPlaceholder(/例: 結婚|e\.g\. Marriage/).fill("大学入学");
    await page.getByPlaceholder(/例: 大学の同級生|e\.g\./).fill("東京の大学に進学した");

    // 年表に表示されることを確認
    await expect(page.getByText("2000")).toBeVisible();
    await expect(page.getByText("大学入学")).toBeVisible();

    // 保存（スクロールしてトップバーの保存ボタンをクリック）
    await blurActiveInput(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText(/^保存$|^Save$/).click({ force: true });

    // 一覧に戻る
    await page.waitForTimeout(1000);
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 15000 });

    // 再度開いてデータが保持されていることを確認
    await page.getByText(/人生記録|Life History/).click();
    await expect(page.getByText("2000")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("大学入学")).toBeVisible();
  });

  test("複数エントリの追加・削除ができる", async ({ page }) => {
    await page.getByText(/人生記録|Life History/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 1つ目のエントリを追加
    await page.getByText(/追加する|Add/).click();
    await page.getByPlaceholder(/例: 1975|e\.g\. 1975/).fill("1980");
    await page.getByPlaceholder(/例: 結婚|e\.g\. Marriage/).fill("誕生");

    // 1つ目のカードを閉じる（年表行をクリック）
    await blurActiveInput(page);
    await page.getByText("1980").first().click();
    await page.waitForTimeout(300);

    // 2つ目のエントリを追加
    await page.getByText(/追加する|Add/).click();
    await page.getByPlaceholder(/例: 1975|e\.g\. 1975/).fill("2010");
    await page.getByPlaceholder(/例: 結婚|e\.g\. Marriage/).fill("転職");

    // 2つのエントリが年表に表示される
    await expect(page.getByText("1980")).toBeVisible();
    await expect(page.getByText("2010")).toBeVisible();
    await expect(page.getByText("転職")).toBeVisible();

    // 2つ目のエントリを削除（編集カードが開いた状態でゴミ箱アイコンをクリック）
    await blurActiveInput(page);
    await page.getByTestId("timeline-delete-1").click();
    await page.waitForTimeout(500);

    // 2つ目が消えて1つ目だけ残る
    await expect(page.getByText("転職")).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText("1980")).toBeVisible();
    await expect(page.getByText("誕生")).toBeVisible();
  });
});

// ============================================================
// ノートブック CRUD テスト（順序依存のため serial）
// ============================================================

test.describe.serial("ノートブック CRUD", () => {
  test("新しいノートブックを作成できる", async ({ page }) => {
    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByTestId("fab").click();
    await expect(page.getByText(/新しいノート|New Notebook/)).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder(/レシピノート|Recipe Book/).fill("テストノートブック");

    await blurActiveInput(page);
    await page.getByText("保存").click();

    await expect(page.getByText("テストノートブック")).toBeVisible({ timeout: 10000 });
  });

  test("ノートブック名が空だと保存されずフォームに留まる", async ({ page }) => {
    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByTestId("fab").click();
    await expect(page.getByText(/新しいノート|New Notebook/)).toBeVisible({ timeout: 5000 });

    // Alert.alert は Web で dialog になるため、自動 accept する
    page.on("dialog", (dialog) => dialog.accept());

    await blurActiveInput(page);
    await page.getByText("保存").click();
    await page.waitForTimeout(500);

    // バリデーションによりフォームに留まっていることを確認
    await expect(page.getByText(/新しいノート|New Notebook/)).toBeVisible();

    await page.getByText(/キャンセル|Cancel/).click();
  });

  test("ノートブックにページを追加できる", async ({ page }) => {
    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByText("テストノートブック").click();
    await expect(page.getByText(/ページがありません|No pages yet/)).toBeVisible({ timeout: 5000 });

    await page.getByTestId("fab").last().click();
    await expect(page.getByText(/新しいページ|New Page/)).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder(/ページのタイトル|Page title/).fill("最初のページ");
    await page.getByPlaceholder(/ページの内容|Enter page content/).fill("テストページの内容です。");

    await blurActiveInput(page);
    await page.getByText("保存").click();

    await expect(page.getByText("最初のページ")).toBeVisible({ timeout: 10000 });
  });

  test("ページを編集できる", async ({ page }) => {
    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByText("テストノートブック").click();
    await expect(page.getByText("最初のページ")).toBeVisible({ timeout: 5000 });

    await page.getByText("最初のページ").click();
    await expect(page.getByText(/ページを編集|Edit Page/)).toBeVisible({ timeout: 5000 });

    const titleInput = page.getByPlaceholder(/ページのタイトル|Page title/);
    await titleInput.clear();
    await titleInput.fill("編集済みページ");

    await blurActiveInput(page);
    await page.getByText("保存").click();

    await expect(page.getByText("編集済みページ")).toBeVisible({ timeout: 10000 });
  });

  // Alert.alert のボタン付き呼び出しが React Native Web で正しく動作しないため skip
  test.skip("ページを削除できる", async ({ page }) => {
    // dialog ハンドラを最初に登録（Alert.alert の confirm を自動承認）
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByText("テストノートブック").click();
    await expect(page.getByText("編集済みページ")).toBeVisible({ timeout: 5000 });

    await page.getByText("編集済みページ").click();
    await expect(page.getByText(/ページを編集|Edit Page/)).toBeVisible({ timeout: 5000 });

    await blurActiveInput(page);
    await page.waitForTimeout(300);
    await page.getByText(/このページを削除|Delete this page/).click({ force: true });

    await expect(page.getByText(/ページがありません|No pages yet/)).toBeVisible({ timeout: 10000 });
  });

  test.skip("ノートブックを削除できる", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByTestId("tab-free").click();
    await page.waitForTimeout(500);

    await page.getByText("テストノートブック").click();
    await expect(page.getByText("テストノートブック")).toBeVisible({ timeout: 5000 });

    await page.getByText(/^削除$|^Delete$/).click();

    await expect(page.getByTestId("tab-free")).toBeVisible({ timeout: 10000 });
  });
});
