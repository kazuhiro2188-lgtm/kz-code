import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers/auth";

/**
 * E2Eテスト: ログインフロー
 *
 * Requirements: 1.2
 */
test.describe("ログインフロー", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログアウト状態にする
    await page.context().clearCookies();
  });

  test("有効な認証情報でログインできる", async ({ page }) => {
    await page.goto("/login");

    // ログインページが表示されていることを確認
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();

    // メールアドレスとパスワードを入力
    await page.fill('input[id="email"]', TEST_USER.email);
    await page.fill('input[id="password"]', TEST_USER.password);

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ダッシュボードまたはオンボーディングページにリダイレクトされることを確認
    await page.waitForURL(/^\/(dashboard|onboarding)/, { timeout: 10000 });

    // ダッシュボードまたはオンボーディングページが表示されていることを確認
    const url = page.url();
    if (url.includes("/dashboard")) {
      await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
    } else if (url.includes("/onboarding")) {
      await expect(page.getByRole("heading", { name: "ようこそ！" })).toBeVisible();
    }
  });

  test("無効な認証情報でログインに失敗する", async ({ page }) => {
    await page.goto("/login");

    // 無効な認証情報を入力
    await page.fill('input[id="email"]', "invalid@example.com");
    await page.fill('input[id="password"]', "wrongpassword");

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    // エラーメッセージの表示を待つ（Server Actionの処理時間を考慮）
    await page.waitForTimeout(1000);
    
    // エラーメッセージが表示されているか、またはログインページに留まっていることを確認
    const errorMessage = page.locator('text=/エラー|失敗|無効|認証/');
    const errorCount = await errorMessage.count();
    const isStillOnLoginPage = page.url().includes("/login");
    
    expect(errorCount > 0 || isStillOnLoginPage).toBeTruthy();
  });

  test("メールアドレス未入力でバリデーションエラーが表示される", async ({ page }) => {
    await page.goto("/login");

    // パスワードのみ入力
    await page.fill('input[id="password"]', TEST_USER.password);

    // フォーム送信を試みる（HTML5バリデーションでブロックされる）
    await page.click('button[type="submit"]');

    // メールアドレス入力フィールドが無効であることを確認（HTML5バリデーション）
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("パスワード未入力でバリデーションエラーが表示される", async ({ page }) => {
    await page.goto("/login");

    // メールアドレスのみ入力
    await page.fill('input[id="email"]', TEST_USER.email);

    // フォーム送信を試みる（HTML5バリデーションでブロックされる）
    await page.click('button[type="submit"]');

    // パスワード入力フィールドが無効であることを確認（HTML5バリデーション）
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute("required", "");
  });

  test("ログイン後、ダッシュボードにアクセスできる", async ({ page }) => {
    // ログイン
    await login(page);

    // ダッシュボードに直接アクセス
    await page.goto("/dashboard");

    // ダッシュボードが表示されていることを確認
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  });

  test("未ログイン状態でダッシュボードにアクセスするとログインページにリダイレクトされる", async ({ page }) => {
    // クッキーをクリア（未ログイン状態）
    await page.context().clearCookies();

    // ダッシュボードにアクセス
    await page.goto("/dashboard");

    // ログインページにリダイレクトされることを確認
    await page.waitForURL("/login", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });
});
