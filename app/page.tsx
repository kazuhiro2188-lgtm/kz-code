import { redirect } from "next/navigation";

/**
 * ルートページ
 * 
 * ミドルウェアで認証チェックを行っているため、
 * ここでは単純にダッシュボードへリダイレクトします。
 */
export default function Home() {
  redirect("/dashboard");
}
