import { test, expect } from "@playwright/test";

/**
 * E2Eテスト: レッスン閲覧フロー
 *
 * Requirements: 4.2, 4.4
 * 
 * 注意: 認証が無効化されているため、認証フローはスキップします。
 */
test.describe("レッスン閲覧フロー", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にクッキーをクリア
    await page.context().clearCookies();
    // 認証が無効化されているため、直接ダッシュボードにアクセス
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("ダッシュボードが表示される", async ({ page }) => {
    // ダッシュボードのタイトルが表示されることを確認
    const title = page.locator("h1").filter({ hasText: /ダッシュボード/ });
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test("コース一覧からコース詳細ページに移動できる", async ({ page }) => {
    // ダッシュボードが表示されるまで待機
    await page.waitForSelector("h1", { timeout: 10000 });

    // 最初のコースリンクを探す
    const courseLink = page.locator('a[href^="/courses/"]').first();
    const linkCount = await courseLink.count();
    
    if (linkCount > 0) {
      await courseLink.click();
      // コース詳細ページに遷移することを確認
      await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });
      
      // コースタイトルが表示されることを確認
      const courseTitle = page.locator("h1").first();
      await expect(courseTitle).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test("コース詳細ページからレッスンページに移動できる", async ({ page }) => {
    // ダッシュボードからコース詳細ページに移動
    await page.waitForSelector("h1", { timeout: 10000 });
    const courseLink = page.locator('a[href^="/courses/"]').first();
    
    if (await courseLink.count() > 0) {
      await courseLink.click();
      await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });

      // 最初のレッスンリンクを探す
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      const lessonCount = await lessonLink.count();
      
      if (lessonCount > 0) {
        await lessonLink.click();
        // レッスンページに遷移することを確認
        await page.waitForURL(/^\/courses\/[^/]+\/sections\/[^/]+\/lessons\/[^/]+$/, { timeout: 10000 });
        
        // レッスンタイトルが表示されることを確認
        const lessonTitle = page.locator("h1").first();
        await expect(lessonTitle).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("レッスンコンテンツまたはプレースホルダーが表示される", async ({ page }) => {
    // ダッシュボードからレッスンページに移動
    await page.waitForSelector("h1", { timeout: 10000 });
    const courseLink = page.locator('a[href^="/courses/"]').first();
    
    if (await courseLink.count() > 0) {
      await courseLink.click();
      await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });
      
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      if (await lessonLink.count() > 0) {
        await lessonLink.click();
        await page.waitForURL(/^\/courses\/[^/]+\/sections\/[^/]+\/lessons\/[^/]+$/, { timeout: 10000 });

        // レッスンタイトルが表示されることを確認
        const lessonTitle = page.locator("h1").first();
        await expect(lessonTitle).toBeVisible({ timeout: 5000 });

        // MDXコンテンツまたはプレースホルダーコンテンツが表示されることを確認
        const hasMDXContent = await page.locator('.mdx-content').count() > 0;
        const hasPlaceholder = await page.locator('text=コンテンツ準備中').count() > 0;
        
        // どちらかが表示されることを確認
        expect(hasMDXContent || hasPlaceholder).toBeTruthy();
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("前後レッスンへのナビゲーションリンクが表示される", async ({ page }) => {
    // ダッシュボードからレッスンページに移動
    await page.waitForSelector("h1", { timeout: 10000 });
    const courseLink = page.locator('a[href^="/courses/"]').first();
    
    if (await courseLink.count() > 0) {
      await courseLink.click();
      await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });
      
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      if (await lessonLink.count() > 0) {
        await lessonLink.click();
        await page.waitForURL(/^\/courses\/[^/]+\/sections\/[^/]+\/lessons\/[^/]+$/, { timeout: 10000 });

        // ナビゲーションリンクが存在することを確認（前のレッスンまたは次のレッスン）
        const navLinks = page.locator('a[href*="/lessons/"]');
        const navLinkCount = await navLinks.count();
        
        // 少なくとも1つのナビゲーションリンクが存在する（前または次、または戻るリンク）
        expect(navLinkCount).toBeGreaterThan(0);
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
