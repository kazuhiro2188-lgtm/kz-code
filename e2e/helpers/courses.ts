import { Page } from "@playwright/test";

/**
 * 最初のコースをクリックしてコース詳細ページに移動します
 */
export async function navigateToFirstCourse(page: Page) {
  // ダッシュボードから最初のコースカードをクリック
  const firstCourseLink = page.locator('a[href^="/courses/"]').first();
  await firstCourseLink.click();
  await page.waitForURL(/^\/courses\/[^/]+$/, { timeout: 10000 });
}

/**
 * 最初のレッスンに移動します
 */
export async function navigateToFirstLesson(page: Page) {
  // コース詳細ページから最初のレッスンリンクをクリック
  const firstLessonLink = page.locator('a[href*="/lessons/"]').first();
  await firstLessonLink.click();
  await page.waitForURL(/^\/courses\/[^/]+\/sections\/[^/]+\/lessons\/[^/]+$/, { timeout: 10000 });
}

/**
 * レッスンを完了します
 */
export async function completeLesson(page: Page) {
  // 「レッスンを完了する」ボタンをクリック
  const completeButton = page.getByRole("button", { name: /レッスンを完了する/ });
  await completeButton.click();

  // 完了メッセージが表示されるまで待機
  await page.waitForSelector('text=このレッスンは完了しています', { timeout: 10000 });
}
