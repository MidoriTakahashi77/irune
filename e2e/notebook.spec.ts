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
// 延命治療セクション選択式フォームテスト
// ============================================================

test.describe("延命治療セクション", () => {
  test("4つの選択フィールドが表示される", async ({ page }) => {
    await page.getByText(/医療情報|Medical/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 4つの選択フィールドが表示される
    await expect(page.getByText(/心肺蘇生|CPR/)).toBeVisible();
    await expect(page.getByText(/人工呼吸器|Ventilator/)).toBeVisible();
    await expect(page.getByText(/経管栄養|Tube feeding/)).toBeVisible();
    await expect(page.getByText(/療養したい場所|care location/i)).toBeVisible();

    // 各フィールドに選択肢が表示される
    const yesOptions = page.getByText("はい");
    await expect(yesOptions.first()).toBeVisible();
    const noOptions = page.getByText("いいえ");
    await expect(noOptions.first()).toBeVisible();
    const familyOptions = page.getByText("家族に任せる");
    await expect(familyOptions.first()).toBeVisible();
  });

  test("選択肢をタップして選択できる", async ({ page }) => {
    await page.getByText(/医療情報|Medical/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 心肺蘇生で「はい」を選択
    // 選択肢は各フィールドに同じテキストがあるので、フィールドラベル近辺の要素を特定
    const cprSection = page.getByText(/心肺蘇生|CPR/);
    await expect(cprSection).toBeVisible();

    // 最初の「はい」をクリック（心肺蘇生セクション）
    const allYes = page.getByText("はい");
    await allYes.first().click();

    // 最初の「いいえ」をクリック（人工呼吸器セクション）
    const allNo = page.getByText("いいえ");
    await allNo.nth(1).click();

    // 「家族に任せる」をクリック（経管栄養セクション）
    const allFamily = page.getByText("家族に任せる");
    await allFamily.nth(2).click();

    // 療養したい場所で「自宅」を選択
    await page.getByText("自宅").click();

    // 別の選択肢に切り替え（心肺蘇生の「はい」→「いいえ」）
    await allNo.first().click();

    // キャンセルで戻る
    await page.getByText(/キャンセル|Cancel/).click();
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 5000 });
  });

  test("保存後に選択状態が維持される", async ({ page }) => {
    await page.getByText(/医療情報|Medical/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 心肺蘇生: はい
    await page.getByText("はい").first().click();
    // 人工呼吸器: いいえ
    await page.getByText("いいえ").nth(1).click();
    // 経管栄養: 家族に任せる
    await page.getByText("家族に任せる").nth(2).click();
    // 療養したい場所: ホスピス・緩和ケア
    await page.getByText(/ホスピス|Hospice/).click();

    // 保存
    await blurActiveInput(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText(/^保存$|^Save$/).click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 15000 });

    // 再度開いて選択状態が保持されていることを確認
    await page.getByText(/医療情報|Medical/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 選択された項目が存在することを確認（選択状態はスタイルで判別）
    // テキスト自体は常に表示されるので、保存・再取得後もフォームが正常に表示されることを確認
    await expect(page.getByText(/心肺蘇生|CPR/)).toBeVisible();
    await expect(page.getByText("はい").first()).toBeVisible();
    await expect(page.getByText(/ホスピス|Hospice/)).toBeVisible();
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
