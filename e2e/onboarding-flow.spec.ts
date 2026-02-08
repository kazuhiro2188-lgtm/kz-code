import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { completeOnboarding } from "./helpers/onboarding";

/**
 * E2Eテスト: オンボーディングフロー
 *
 * Requirements: 2.1, 2.2
 */
test.describe("オンボーディングフロー", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログアウト状態にする
    await page.context().clearCookies();
  });

  test("初回ログイン後にオンボーディングページが表示される", async ({ page }) => {
    // ログイン（新規ユーザーの場合、オンボーディングページにリダイレクトされる）
    await login(page);

    // オンボーディングページが表示されることを確認
    await page.waitForURL("/onboarding", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "ようこそ！" })).toBeVisible();
  });

  test("オンボーディングを完了してダッシュボードに遷移できる", async ({ page }) => {
    // ログイン
    await login(page);

    // オンボーディングページに移動（既にオンボーディング済みの場合はスキップ）
    const currentUrl = page.url();
    if (!currentUrl.includes("/onboarding")) {
      await page.goto("/onboarding");
    }

    // オンボーディングを完了
    await completeOnboarding(page);

    // ダッシュボードにリダイレクトされることを確認
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  });

  test("オンボーディング完了後、再度オンボーディングページにアクセスするとダッシュボードにリダイレクトされる", async ({ page }) => {
    // ログイン
    await login(page);

    // オンボーディングを完了
    await completeOnboarding(page);

    // オンボーディングページに直接アクセス
    await page.goto("/onboarding");

    // ダッシュボードにリダイレクトされることを確認
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  });

  test("学習目標と経験レベルを選択せずに送信するとエラーが表示される", async ({ page }) => {
    // ログイン
    await login(page);

    // オンボーディングページに移動
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: "ようこそ！" })).toBeVisible();

    // 何も選択せずに送信ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/すべての項目を選択してください/');
    await expect(errorMessage).toBeVisible();
  });

  test("学習目標のみ選択して送信するとエラーが表示される", async ({ page }) => {
    // ログイン
    await login(page);

    // オンボーディングページに移動
    await page.goto("/onboarding");

    // 学習目標のみ選択
    await page.click('input[type="radio"][name="learningGoal"][value="ai-driven-development-basics"]');

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/すべての項目を選択してください/');
    await expect(errorMessage).toBeVisible();
  });

  test("経験レベルのみ選択して送信するとエラーが表示される", async ({ page }) => {
    // ログイン
    await login(page);

    // オンボーディングページに移動
    await page.goto("/onboarding");

    // 経験レベルのみ選択
    await page.click('input[type="radio"][name="experienceLevel"][value="beginner"]');

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/すべての項目を選択してください/');
    await expect(errorMessage).toBeVisible();
  });
});
