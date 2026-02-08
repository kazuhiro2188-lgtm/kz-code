import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { completeOnboarding } from "./helpers/onboarding";
import { navigateToFirstCourse, navigateToFirstLesson } from "./helpers/courses";

/**
 * E2Eテスト: AI チャットフロー
 *
 * Requirements: 5.2, 5.3
 */
test.describe("AI チャットフロー", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログアウト状態にする
    await page.context().clearCookies();
  });

  test("レッスンページでAIチャットUIが表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // AIアシスタントセクションが表示されていることを確認
    await expect(page.getByRole("heading", { name: "AI アシスタント" })).toBeVisible();

    // チャット入力フィールドが表示されていることを確認
    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');
    await expect(chatInput).toBeVisible();
  });

  test("メッセージを送信できる", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // チャット入力フィールドにメッセージを入力
    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');
    await chatInput.fill("AI駆動開発とは何ですか？");

    // 送信ボタンをクリック（またはEnterキーを押す）
    await chatInput.press("Enter");

    // メッセージが送信されたことを確認（ユーザーメッセージが表示される）
    await page.waitForTimeout(1000);
    
    // ユーザーメッセージが表示されていることを確認
    const userMessage = page.locator('text=AI駆動開発とは何ですか？');
    await expect(userMessage).toBeVisible({ timeout: 5000 });
  });

  test("ストリーミング応答が表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // チャット入力フィールドにメッセージを入力
    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');
    await chatInput.fill("こんにちは");

    // 送信
    await chatInput.press("Enter");

    // ストリーミング応答が表示されることを確認（アシスタントメッセージが表示される）
    // ストリーミングには時間がかかるため、タイムアウトを長めに設定
    await page.waitForTimeout(2000);
    
    // アシスタントメッセージが表示されていることを確認（ローディング状態または応答テキスト）
    const assistantMessage = page.locator('.text-gray-700, .dark\\:text-gray-300').filter({ hasText: /./ });
    await expect(assistantMessage.first()).toBeVisible({ timeout: 30000 });
  });

  test("複数のメッセージを送信して会話履歴が保持される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');

    // 1つ目のメッセージを送信
    await chatInput.fill("最初の質問");
    await chatInput.press("Enter");
    await page.waitForTimeout(2000);

    // 2つ目のメッセージを送信
    await chatInput.fill("2つ目の質問");
    await chatInput.press("Enter");
    await page.waitForTimeout(2000);

    // 両方のメッセージが表示されていることを確認
    await expect(page.locator('text=最初の質問')).toBeVisible();
    await expect(page.locator('text=2つ目の質問')).toBeVisible();
  });

  test("ローディング中は送信ボタンが無効化される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');
    await chatInput.fill("テストメッセージ");

    // 送信
    await chatInput.press("Enter");

    // ローディング中は入力フィールドが無効化されることを確認
    await page.waitForTimeout(500);
    await expect(chatInput).toBeDisabled();
  });

  test("エラー発生時にエラーメッセージが表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // APIエラーをシミュレートするために、ネットワークリクエストをインターセプト
    await page.route("**/api/chat/stream", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    const chatInput = page.locator('input[placeholder="メッセージを入力..."]');
    await chatInput.fill("エラーテスト");
    await chatInput.press("Enter");

    // エラーメッセージが表示されることを確認
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=/エラー|失敗|問題が発生/');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
