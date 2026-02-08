import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * 認証エラーの型定義
 */
export type AuthError = {
  message: string;
  code?: string;
};

/**
 * Result 型（成功または失敗を表現）
 */
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * AuthService インターフェース
 * 
 * Supabase Auth 操作を抽象化し、認証ページから利用可能なインターフェースを提供します。
 */
export interface AuthService {
  signUp(email: string, password: string): Promise<Result<{ user: User }, AuthError>>;
  signIn(email: string, password: string): Promise<Result<{ user: User }, AuthError>>;
  resetPassword(email: string): Promise<Result<void, AuthError>>;
  signOut(): Promise<Result<void, AuthError>>;
}

/**
 * メールアドレスの形式を検証します
 * 開発環境ではより柔軟なバリデーションを適用
 */
function validateEmail(email: string): boolean {
  // 開発環境では、基本的な形式チェックのみ
  const isDevMode = process.env.NODE_ENV === "development" || process.env.ALLOW_SIMPLE_PASSWORD === "true";
  
  if (isDevMode) {
    // 開発環境: @マークが含まれていればOK（簡易チェック）
    return email.includes("@") && email.length > 3;
  }
  
  // 本番環境: 標準的なメールアドレス形式をチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * パスワードの形式を検証します
 * 開発環境では簡易パスワードを許可（最小4文字）
 * 本番環境では最小8文字、英数字を含む
 */
function validatePassword(password: string): boolean {
  // 開発モードが有効な場合、簡易パスワードを許可
  const isDevMode = process.env.NODE_ENV === "development" || process.env.ALLOW_SIMPLE_PASSWORD === "true";
  
  if (isDevMode) {
    // 開発環境: 最小4文字
    return password.length >= 4;
  }
  
  // 本番環境: 最小8文字、英数字を含む
  if (password.length < 8) {
    return false;
  }
  // 英数字を含むかチェック（簡易版）
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Supabase Auth のエラーをアプリケーション固有のエラー型に変換します
 */
function mapSupabaseError(error: unknown): AuthError {
  if (error && typeof error === "object" && "message" in error) {
    const supabaseError = error as { message: string; status?: number };
    let message = supabaseError.message || "認証エラーが発生しました";
    
    const isDevMode = process.env.NODE_ENV === "development" || process.env.ALLOW_SIMPLE_PASSWORD === "true";
    
    // メール送信レート制限エラーの場合
    if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("email rate limit")) {
      if (isDevMode) {
        message = `メール送信レート制限に達しました。\n\n開発環境では、Supabaseダッシュボードで「Disable email confirmations」を有効にしてください。\n設定場所: Authentication > Settings > Email Auth > Disable email confirmations`;
      } else {
        message = "メール送信レート制限に達しました。しばらく時間をおいてから再度お試しください。";
      }
    }
    
    // 開発環境では、メールアドレスエラーに対してより分かりやすいメッセージを表示
    if (isDevMode && message.includes("invalid") && message.includes("email")) {
      message = `${message}\n\n開発環境では、実際に存在するメールアドレス形式を使用してください。\n例: admin@test.com, admin@localhost.local など`;
    }
    
    return {
      message,
      code: supabaseError.status?.toString(),
    };
  }
  return {
    message: "予期しないエラーが発生しました",
  };
}

/**
 * AuthService の実装
 */
export const authService: AuthService = {
  /**
   * ユーザーをサインアップします
   * 
   * @param email - メールアドレス
   * @param password - パスワード
   * @returns 成功時はユーザー情報、失敗時はエラー
   */
  async signUp(email: string, password: string): Promise<Result<{ user: User }, AuthError>> {
    // 入力検証
    if (!validateEmail(email)) {
      return {
        success: false,
        error: {
          message: "有効なメールアドレスを入力してください",
        },
      };
    }

    if (!validatePassword(password)) {
      const isDevMode = process.env.NODE_ENV === "development" || process.env.ALLOW_SIMPLE_PASSWORD === "true";
      return {
        success: false,
        error: {
          message: isDevMode
            ? "パスワードは4文字以上である必要があります"
            : "パスワードは8文字以上で、英数字を含む必要があります",
        },
      };
    }

    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: {
            message: "ユーザーの作成に失敗しました",
          },
        };
      }

      return {
        success: true,
        data: { user: data.user },
      };
    } catch (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }
  },

  /**
   * ユーザーをログインします
   * 
   * @param email - メールアドレス
   * @param password - パスワード
   * @returns 成功時はユーザー情報、失敗時はエラー
   */
  async signIn(email: string, password: string): Promise<Result<{ user: User }, AuthError>> {
    // 入力検証
    if (!validateEmail(email)) {
      return {
        success: false,
        error: {
          message: "有効なメールアドレスを入力してください",
        },
      };
    }

    if (!password) {
      return {
        success: false,
        error: {
          message: "パスワードを入力してください",
        },
      };
    }

    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: {
            message: "ログインに失敗しました",
          },
        };
      }

      return {
        success: true,
        data: { user: data.user },
      };
    } catch (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }
  },

  /**
   * パスワードリセットメールを送信します
   * 
   * @param email - メールアドレス
   * @returns 成功時は void、失敗時はエラー
   */
  async resetPassword(email: string): Promise<Result<void, AuthError>> {
    // 入力検証
    if (!validateEmail(email)) {
      return {
        success: false,
        error: {
          message: "有効なメールアドレスを入力してください",
        },
      };
    }

    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }
  },

  /**
   * ユーザーをログアウトします
   * 
   * @returns 成功時は void、失敗時はエラー
   */
  async signOut(): Promise<Result<void, AuthError>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }
  },
};
