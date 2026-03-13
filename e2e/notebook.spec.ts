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
// 手紙メッセージセクション
// ============================================================

test.describe("手紙メッセージセクション", () => {
  test("メッセージテンプレートを開いて手紙フィールドが表示される", async ({ page }) => {
    await page.getByText(/メッセージ|Message/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 手紙ラベルと空メッセージが表示される
    await expect(page.getByText(/^手紙$|^Letters$/)).toBeVisible();
    await expect(page.getByText(/まだ手紙がありません|No letters yet/)).toBeVisible();
    // 追加ボタンが表示される
    await expect(page.getByText(/手紙を書く|Write a letter/)).toBeVisible();

    await page.getByText(/キャンセル|Cancel/).click();
  });

  test("手紙を追加して宛名・関係・メッセージを入力できる", async ({ page }) => {
    await page.getByText(/メッセージ|Message/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 手紙を書くボタンをクリック → 編集カードが展開
    await page.getByText(/手紙を書く|Write a letter/).click();

    // 宛名を入力
    const recipientInput = page.getByPlaceholder(/太郎|recipientName/);
    await expect(recipientInput).toBeVisible({ timeout: 3000 });
    await recipientInput.fill("太郎");

    // 関係を入力
    const relationInput = page.getByPlaceholder(/長男|recipientRelation/);
    await relationInput.fill("長男");

    // メッセージを入力
    const messageInput = page.getByPlaceholder(/伝えたいこと/);
    await messageInput.fill("いつもありがとう");

    await blurActiveInput(page);
    await page.getByText(/キャンセル|Cancel/).click();
  });

  test("手紙を保存後に再度開くと手紙カードで表示される", async ({ page }) => {
    await page.getByText(/メッセージ|Message/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 手紙を追加して入力
    await page.getByText(/手紙を書く|Write a letter/).click();
    const recipientInput = page.getByPlaceholder(/太郎|recipientName/);
    await expect(recipientInput).toBeVisible({ timeout: 3000 });
    await recipientInput.fill("花子");

    const relationInput = page.getByPlaceholder(/長男|recipientRelation/);
    await relationInput.fill("妻");

    const messageInput = page.getByPlaceholder(/伝えたいこと/);
    await messageInput.fill("ずっと感謝しています");

    // 保存
    await blurActiveInput(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText(/^保存$|^Save$/).click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 15000 });

    // 再度開いてデータが保持されていることを確認
    await page.getByText(/メッセージ|Message/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });
    // 手紙カードの表示モードで宛名が表示されている
    await expect(page.getByText("花子")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/ずっと感謝しています/)).toBeVisible();

    // タップで編集モードに切り替わる
    await page.getByText("花子").click();
    await expect(page.locator('input[value="花子"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('input[value="妻"]')).toBeVisible();
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
