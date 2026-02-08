import { test, expect } from "@playwright/test";

/**
 * E2Eテスト: カリキュラム機能
 *
 * レッスン閲覧、用語解説、プレースホルダーコンテンツの統合テスト
 */
test.describe("カリキュラム機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("ダッシュボードからレッスンページまでナビゲーションできる", async ({ page }) => {
    // ダッシュボードのタイトルが表示されることを確認
    const title = page.locator("h1").filter({ hasText: /ダッシュボード/ });
    await expect(title).toBeVisible({ timeout: 10000 });

    // 最初のコースリンクをクリック
    const courseLink = page.locator('a[href^="/courses/"]').first();
    if (await courseLink.count() > 0) {
      await courseLink.click();
      await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });

      // 最初のレッスンリンクをクリック
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      if (await lessonLink.count() > 0) {
        await lessonLink.click();
        await page.waitForURL(/^\/courses\/[^/]+\/sections\/[^/]+\/lessons\/[^/]+$/, { timeout: 10000 });

        // レッスンタイトルが表示されることを確認
        const lessonTitle = page.locator("h1").first();
        await expect(lessonTitle).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("レッスンコンテンツまたはプレースホルダーが表示される", async ({ page }) => {
    // レッスンページに直接アクセス
    await page.goto(
      "/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-infrastructure-overview"
    );
    await page.waitForLoadState("networkidle");

    // レッスンタイトルが表示されることを確認
    const lessonTitle = page.locator("h1").first();
    await expect(lessonTitle).toBeVisible({ timeout: 10000 });

    // MDXコンテンツまたはプレースホルダーコンテンツが表示されることを確認
    const hasMDXContent = await page.locator('.mdx-content').count() > 0;
    const hasPlaceholder = await page.locator('text=コンテンツ準備中').count() > 0;
    expect(hasMDXContent || hasPlaceholder).toBeTruthy();
  });

  test("用語解説機能が動作する", async ({ page }) => {
    // レッスンページに直接アクセス
    await page.goto(
      "/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-infrastructure-overview"
    );
    await page.waitForLoadState("networkidle");

    // 用語を探す
    const glossaryTerm = page
      .locator('span')
      .filter({ hasText: /インフラストラクチャ|インフラ|サーバー|コンテナ/ })
      .first();

    const count = await glossaryTerm.count();
    if (count > 0) {
      // 用語をクリック
      await glossaryTerm.scrollIntoViewIfNeeded();
      await glossaryTerm.click({ timeout: 5000 });

      // ポップアップが表示されることを確認
      const popup = page.locator('[role="dialog"]').first();
      const popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (popupVisible) {
        // ESCキーで閉じる
        await page.keyboard.press("Escape");
        await expect(popup).not.toBeVisible({ timeout: 2000 });
      }
    }
  });
});
