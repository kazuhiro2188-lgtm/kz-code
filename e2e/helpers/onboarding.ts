import { Page } from "@playwright/test";

/**
 * オンボーディングを完了します
 */
export async function completeOnboarding(
  page: Page,
  learningGoal: string = "ai-driven-development-basics",
  experienceLevel: string = "beginner"
) {
  await page.goto("/onboarding");

  // 学習目標を選択
  await page.click(`input[type="radio"][name="learningGoal"][value="${learningGoal}"]`);

  // 経験レベルを選択
  await page.click(`input[type="radio"][name="experienceLevel"][value="${experienceLevel}"]`);

  // 送信ボタンをクリック
  await page.click('button[type="submit"]');

  // ダッシュボードにリダイレクトされるまで待機
  await page.waitForURL("/dashboard", { timeout: 10000 });
}
