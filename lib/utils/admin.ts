import { headers } from "next/headers";
import { cookies } from "next/headers";

/**
 * 管理者バイパスが有効かどうかをチェック
 * 
 * クエリパラメータまたはCookieから管理者バイパスキーを確認します。
 */
export async function isAdminBypassEnabled(): Promise<boolean> {
  const adminBypassKey = process.env.ADMIN_BYPASS_KEY;
  
  if (!adminBypassKey) {
    return false;
  }

  // クエリパラメータから取得（Server Componentでは直接取得できないため、Cookie経由）
  const cookieStore = await cookies();
  const adminKeyFromCookie = cookieStore.get("admin-bypass-key")?.value;
  
  // Cookieに管理者キーが設定されており、環境変数と一致する場合
  if (adminKeyFromCookie === adminBypassKey) {
    return true;
  }

  return false;
}

/**
 * 管理者用のダミーユーザーIDを取得
 */
export function getAdminDummyUserId(): string {
  return "00000000-0000-0000-0000-000000000000";
}
