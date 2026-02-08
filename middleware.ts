import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 認証が無効化されている場合は、すべてのリクエストを許可
  if (process.env.DISABLE_AUTH === "true") {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/reset-password");

  const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding");

  // 未認証ユーザーをログインページへリダイレクト
  if (!user && !isAuthPage && !isOnboardingPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーが認証ページにアクセスした場合、ダッシュボードへリダイレクト
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーのオンボーディング状態をチェック
  // ただし、ダッシュボードページへのアクセスは許可（プロフィール自動作成のため）
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  
  if (user && !isAuthPage && !isOnboardingPage && !isDashboardPage) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // プロフィールが存在しない場合（新規ユーザー）はオンボーディングページへリダイレクト
      if (profileError) {
        // PGRST116 は「行が見つからない」エラー（正常なケース）
        if (profileError.code === "PGRST116") {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding";
          return NextResponse.redirect(url);
        }
        // その他のエラーはログに記録して続行
        console.error("プロフィール取得エラー:", profileError);
      }

      // プロフィールが存在し、オンボーディング未完了の場合はオンボーディングページへリダイレクト
      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // プロフィールが存在しない場合もオンボーディングへ
      if (!profile) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // エラーが発生した場合はログに記録して続行（ページの表示を許可）
      console.error("ミドルウェアエラー:", error);
    }
  }

  // ダッシュボードページへのアクセス時は、オンボーディング未完了の場合のみリダイレクト
  if (user && isDashboardPage) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // プロフィールが存在し、オンボーディング未完了の場合はオンボーディングページへリダイレクト
      if (!profileError && profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
      // プロフィールが存在しない場合は、ダッシュボード側で自動作成するため許可
    } catch (error) {
      // エラーが発生した場合はログに記録して続行（ページの表示を許可）
      console.error("ミドルウェアエラー:", error);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
