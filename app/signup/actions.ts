"use server";

import { authService } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * サインアップ Server Action
 * 
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns エラーメッセージ（成功時は null）
 */
export async function signUpAction(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const result = await authService.signUp(email, password);

  if (!result.success) {
    return { error: result.error.message };
  }

  // プロフィールを作成（新規ユーザーの場合）
  const supabase = await createServerSupabaseClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: result.data.user.id,
      onboarding_completed: false,
    } as never)
    .select()
    .single();

  // プロフィール作成エラーは無視（既に存在する場合など）
  if (profileError && profileError.code !== "23505") {
    // 23505 は重複エラー（既にプロフィールが存在する場合）
    console.error("Failed to create profile:", profileError);
  }

  // オンボーディング未完了なので、オンボーディングページへリダイレクト
  redirect("/onboarding");
}
