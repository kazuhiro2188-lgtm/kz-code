import { Page } from "@playwright/test";

/**
 * テスト用のユーザー認証情報
 */
export const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || "test@example.com",
  password: process.env.E2E_TEST_USER_PASSWORD || "TestPassword123",
};

/**
 * ログインを実行します
 */
export async function login(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto("/login");
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  // ダッシュボードまたはオンボーディングページにリダイレクトされるまで待機
  await page.waitForURL(/^\/(dashboard|onboarding)/, { timeout: 10000 });
}

/**
 * ログアウトを実行します
 */
export async function logout(page: Page) {
  // ログアウト機能が実装されていない場合は、セッションをクリア
  await page.context().clearCookies();
}
