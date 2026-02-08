import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { completeOnboarding } from "./helpers/onboarding";
import { navigateToFirstCourse, navigateToFirstLesson, completeLesson } from "./helpers/courses";

/**
 * E2Eテスト: レッスン閲覧フロー
 *
 * Requirements: 4.2, 4.4
 */
test.describe("レッスン閲覧フロー", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログアウト状態にする
    await page.context().clearCookies();
  });

  test("コース一覧からコース詳細ページに移動できる", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // ダッシュボードから最初のコースをクリック
    await navigateToFirstCourse(page);

    // コース詳細ページが表示されていることを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test("コース詳細ページからレッスンページに移動できる", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // コース詳細ページに移動
    await navigateToFirstCourse(page);

    // 最初のレッスンに移動
    await navigateToFirstLesson(page);

    // レッスンページが表示されていることを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test("レッスンコンテンツ（MDX）が表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // MDXコンテンツが表示されていることを確認（コンテンツエリアが存在する）
    const contentArea = page.locator('.bg-white, .dark\\:bg-gray-800').first();
    await expect(contentArea).toBeVisible();

    // レッスンタイトルが表示されていることを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test("レッスンを完了できる", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // 「レッスンを完了する」ボタンが表示されていることを確認
    const completeButton = page.getByRole("button", { name: /レッスンを完了する/ });
    await expect(completeButton).toBeVisible();

    // レッスンを完了
    await completeLesson(page);

    // 完了メッセージが表示されることを確認
    await expect(page.locator('text=このレッスンは完了しています')).toBeVisible();
  });

  test("完了済みレッスンには完了メッセージが表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // レッスンを完了
    await completeLesson(page);

    // ページをリロード
    await page.reload();

    // 完了メッセージが表示されることを確認
    await expect(page.locator('text=このレッスンは完了しています')).toBeVisible();

    // 「レッスンを完了する」ボタンが表示されていないことを確認
    const completeButton = page.getByRole("button", { name: /レッスンを完了する/ });
    await expect(completeButton).toHaveCount(0);
  });

  test("前後レッスンへのナビゲーションリンクが表示される", async ({ page }) => {
    // ログインとオンボーディング完了
    await login(page);
    await completeOnboarding(page);

    // レッスンページに移動
    await navigateToFirstCourse(page);
    await navigateToFirstLesson(page);

    // ナビゲーションリンクが存在することを確認（前のレッスンまたは次のレッスン）
    const navLinks = page.locator('a[href*="/lessons/"]');
    const navLinkCount = await navLinks.count();
    
    // 少なくとも1つのナビゲーションリンクが存在する（前または次）
    expect(navLinkCount).toBeGreaterThan(0);
  });
});
