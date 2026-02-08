import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Server Component 用の Supabase クライアントを作成します
 * 
 * この関数は Server Component、Server Actions、Route Handlers から呼び出し可能です。
 * Cookie ベースのセッション管理により、認証状態が自動的に同期されます。
 * 
 * @returns Supabase クライアントインスタンス
 * 
 * @example
 * ```tsx
 * // Server Component での使用例
 * import { createServerSupabaseClient } from "@/lib/supabase/server";
 * 
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   // ...
 * }
 * ```
 */
export async function createServerSupabaseClient(): Promise<
  ReturnType<typeof createServerClient<Database>>
> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Server Component から Cookie を設定できない場合のエラーハンドリング
            // この場合は middleware で Cookie が設定されます
            console.error("Failed to set cookies in Server Component:", error);
          }
        },
      },
    }
  );
}
