import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Client Component 用の Supabase クライアントを作成します
 * 
 * この関数は Client Component（`"use client"`）から呼び出し可能です。
 * ブラウザ環境でのセッション管理を自動的に処理します。
 * 
 * @returns Supabase クライアントインスタンス
 * 
 * @example
 * ```tsx
 * // Client Component での使用例
 * "use client";
 * 
 * import { createBrowserSupabaseClient } from "@/lib/supabase/client";
 * 
 * export default function Component() {
 *   const supabase = createBrowserSupabaseClient();
 *   // ...
 * }
 * ```
 */
export function createBrowserSupabaseClient(): ReturnType<typeof createBrowserClient<Database>> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
