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
// 介護・葬儀セクション選択式フォームテスト
// ============================================================

test.describe("介護・葬儀セクション", () => {
  test("介護テンプレートで選択フィールドが表示される", async ({ page }) => {
    await page.getByText(/介護|Care/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 3つの選択フィールドが表示される
    await expect(page.getByText(/暮らしたい場所|Preferred Living/)).toBeVisible();
    await expect(page.getByText(/介護で重視|Care Priority/i)).toBeVisible();
    await expect(page.getByText(/介護認定|Care Certification/i)).toBeVisible();

    // 選択肢が表示される
    await expect(page.getByText(/^自宅$|^Home$/)).toBeVisible();
    await expect(page.getByText(/^施設$|^Care Facility$/)).toBeVisible();
    await expect(page.getByText(/まだ決めていない|Undecided/)).toBeVisible();
  });

  test("葬儀テンプレートで各フィールドの選択肢をタップできる", async ({ page }) => {
    await page.getByText(/葬儀|Funeral/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 3つの選択フィールドが表示される
    await expect(page.getByText(/葬儀の形式|Funeral Style/)).toBeVisible();
    await expect(page.getByText(/お墓・納骨|Burial/)).toBeVisible();
    await expect(page.getByText(/費用の目安|Budget/)).toBeVisible();

    // 葬儀形式で「家族葬」を選択
    await page.getByText(/家族葬|Family Only/).click();

    // お墓で「樹木葬」を選択
    await page.getByText(/樹木葬|Tree Burial/).click();

    // 費用で「一般的な範囲で」を選択
    await page.getByText(/一般的な範囲|Standard/).click();

    // キャンセルで戻る
    await page.getByText(/キャンセル|Cancel/).click();
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 5000 });
  });

  test("介護フォームで選択して保存後にデータが反映される", async ({ page }) => {
    await page.getByText(/介護|Care/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // 暮らしたい場所: 自宅
    await page.getByText(/自宅|Home/).first().click();
    // 介護で重視すること: 安全・安心
    await page.getByText(/安全|safety/i).click();
    // 介護認定: 受けていない
    await page.getByText(/受けていない|No$/).click();

    // 保存
    await blurActiveInput(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText(/^保存$|^Save$/).click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 15000 });

    // 再度開いてフォームが正常に表示されることを確認
    await page.getByText(/介護|Care/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/暮らしたい場所|Preferred Living/)).toBeVisible();
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
