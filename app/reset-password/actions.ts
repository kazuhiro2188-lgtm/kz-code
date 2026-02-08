"use server";

import { authService } from "@/lib/services/auth";

/**
 * パスワードリセット Server Action
 * 
 * @param email - メールアドレス
 * @returns エラーメッセージ（成功時は null）
 */
export async function resetPasswordAction(
  email: string
): Promise<{ error: string | null }> {
  const result = await authService.resetPassword(email);

  if (!result.success) {
    return { error: result.error.message };
  }

  return { error: null };
}
