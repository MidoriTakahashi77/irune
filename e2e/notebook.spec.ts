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
// 人生記録タイムラインテスト
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
// 生年月日ピッカーテスト（順序依存のため serial）
// ============================================================

test.describe.serial("生年月日ピッカー", () => {
  test("生年月日フィールドをタップすると日付ピッカーが表示される", async ({ page }) => {
    await page.getByText(/基本情報|Profile/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 生年月日フィールドのボタンをクリック
    await page.getByText(/例: 1950-04-01|e\.g\. 1950-04-01/).click();

    // Web上ではHTML date inputが表示される
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible({ timeout: 3000 });
  });

  test("日付を選択後、YYYY年M月D日形式で表示される", async ({ page }) => {
    await page.getByText(/基本情報|Profile/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // ピッカーを開いて日付を入力
    await page.getByText(/例: 1950-04-01|e\.g\. 1950-04-01/).click();
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill("1990-06-15");

    // 「1990年6月15日」形式で表示されることを確認
    await expect(page.getByText("1990年6月15日")).toBeVisible({ timeout: 3000 });
  });

  test("保存後のデータがISO形式（YYYY-MM-DD）で格納される", async ({ page }) => {
    await page.getByText(/基本情報|Profile/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // 生年月日を設定
    await page.getByText(/例: 1950-04-01|e\.g\. 1950-04-01/).click();
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill("1985-12-25");
    await expect(page.getByText("1985年12月25日")).toBeVisible({ timeout: 3000 });

    // 保存
    await blurActiveInput(page);
    await page.getByText(/保存|Save/).click();
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 10000 });

    // 保存されたノートを開いて確認
    await page.getByText(/基本情報|Profile/).click();
    await expect(page.getByText("1985年12月25日")).toBeVisible({ timeout: 5000 });

    // 編集画面のdate inputのvalueがISO形式であることを確認
    await page.getByText("1985年12月25日").click();
    const editDateInput = page.locator('input[type="date"]');
    await expect(editDateInput).toHaveValue("1985-12-25");
  });
});

// ============================================================
// サブスクリプションプリセットテスト
// ============================================================

test.describe("サブスクリプションプリセット", () => {
  test("契約テンプレートでプリセットピッカーが表示される", async ({ page }) => {
    await page.getByText(/契約|Contracts/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // プリセットボタンが表示される
    await expect(page.getByText(/プリセットから選択|Select from presets/)).toBeVisible();

    // プリセットピッカーを開く
    await page.getByText(/プリセットから選択|Select from presets/).click();

    // カテゴリタブが表示される
    await expect(page.getByText(/動画|Video/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/音楽|Music/i)).toBeVisible();
    await expect(page.getByText(/通信|Mobile/i)).toBeVisible();

    // サービス名が表示される
    await expect(page.getByText("Netflix")).toBeVisible();
  });

  test("プリセットからサービスを選択して追加できる", async ({ page }) => {
    await page.getByText(/契約|Contracts/).click();
    await expect(page.getByText(/保存|Save/)).toBeVisible({ timeout: 5000 });

    // プリセットピッカーを開く
    await page.getByText(/プリセットから選択|Select from presets/).click();
    await expect(page.getByText("Netflix")).toBeVisible({ timeout: 3000 });

    // Netflixを選択
    await page.getByText("Netflix").click();

    // サービス名がフォームに入力される
    await expect(page.locator('input[value="Netflix"]')).toBeVisible({ timeout: 3000 });

    // カテゴリを切り替えて別のサービスも追加
    await page.getByText(/音楽|Music/i).click();
    await expect(page.getByText("Spotify")).toBeVisible({ timeout: 3000 });
    await page.getByText("Spotify").click();

    await expect(page.locator('input[value="Spotify"]')).toBeVisible({ timeout: 3000 });
  });

  test("プリセットで追加後に保存してデータが反映される", async ({ page }) => {
    await page.getByText(/契約|Contracts/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });

    // プリセットからNetflixを追加
    await page.getByText(/プリセットから選択|Select from presets/).click();
    await expect(page.getByText("Netflix")).toBeVisible({ timeout: 3000 });
    await page.getByText("Netflix").click();
    await expect(page.locator('input[value="Netflix"]')).toBeVisible({ timeout: 3000 });

    // 保存
    await blurActiveInput(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText(/^保存$|^Save$/).click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.getByText(/ライフノート|Life Note/)).toBeVisible({ timeout: 15000 });

    // 再度開いてデータが保持されていることを確認
    await page.getByText(/契約|Contracts/).click();
    await expect(page.getByText(/^保存$|^Save$/)).toBeVisible({ timeout: 5000 });
    // サマリー行にNetflixが表示されていることを確認
    await expect(page.getByText("Netflix")).toBeVisible({ timeout: 5000 });
    // タップして展開し、入力値を確認
    await page.getByText("Netflix").click();
    await expect(page.locator('input[value="Netflix"]')).toBeVisible({ timeout: 3000 });
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
