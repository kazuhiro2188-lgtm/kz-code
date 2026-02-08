"use server";

import { authService } from "@/lib/services/auth";
import { redirect } from "next/navigation";

/**
 * ログイン Server Action
 * 
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns エラーメッセージ（成功時は null）
 */
export async function signInAction(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const result = await authService.signIn(email, password);

  if (!result.success) {
    return { error: result.error.message };
  }

  // 成功時はダッシュボードへリダイレクト
  redirect("/dashboard");
}
