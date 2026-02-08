import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * ルートページ
 * 
 * 認証状態に応じて適切なページへリダイレクトします。
 * ミドルウェアでも処理されますが、ここでも明示的に処理します。
 */
export default async function Home() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("認証エラー:", authError);
      redirect("/login");
    }

    if (!user) {
      redirect("/login");
    }

    // オンボーディング状態を確認
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("プロフィール取得エラー:", profileError);
      // プロフィールが存在しない場合はオンボーディングへ
      redirect("/onboarding");
    }

    if (profile && !profile.onboarding_completed) {
      redirect("/onboarding");
    }

    redirect("/dashboard");
  } catch (error) {
    console.error("ルートページエラー:", error);
    redirect("/login");
  }
}
