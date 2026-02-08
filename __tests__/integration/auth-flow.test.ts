/**
 * 統合テスト: 認証フロー
 *
 * サインアップ → ログイン → ダッシュボード のフローをテストします。
 * Supabase Auth をモックして、AuthService の各メソッドを検証します。
 *
 * Requirements: 1.1, 1.2
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock はホイストされるため、vi.hoisted() で変数を先に定義
const { mockAuth, mockSupabaseClient } = vi.hoisted(() => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
  };
  const mockSupabaseClient = {
    auth: mockAuth,
    from: vi.fn(),
  };
  return { mockAuth, mockSupabaseClient };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

// テスト対象
import { authService } from "@/lib/services/auth";

describe("認証フロー統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // サインアップのテスト
  // =============================================
  describe("サインアップ", () => {
    it("有効なメールアドレスとパスワードでサインアップできる", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signUp("test@example.com", "password123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.id).toBe("user-123");
        expect(result.data.user.email).toBe("test@example.com");
      }
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("無効なメールアドレスではサインアップに失敗する", async () => {
      const result = await authService.signUp("invalid-email", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("有効なメールアドレスを入力してください");
      }
      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });

    it("短すぎるパスワードではサインアップに失敗する", async () => {
      const result = await authService.signUp("test@example.com", "short1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(
          "パスワードは8文字以上で、英数字を含む必要があります"
        );
      }
      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });

    it("英字のみのパスワードではサインアップに失敗する", async () => {
      const result = await authService.signUp("test@example.com", "password");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(
          "パスワードは8文字以上で、英数字を含む必要があります"
        );
      }
    });

    it("数字のみのパスワードではサインアップに失敗する", async () => {
      const result = await authService.signUp("test@example.com", "12345678");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(
          "パスワードは8文字以上で、英数字を含む必要があります"
        );
      }
    });

    it("Supabase Authがエラーを返した場合、適切なエラーメッセージを返す", async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: {
          message: "User already registered",
          status: 400,
        },
      });

      const result = await authService.signUp("test@example.com", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("User already registered");
        expect(result.error.code).toBe("400");
      }
    });

    it("Supabase Authがユーザーを返さない場合、エラーを返す", async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.signUp("test@example.com", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("ユーザーの作成に失敗しました");
      }
    });
  });

  // =============================================
  // ログインのテスト
  // =============================================
  describe("ログイン", () => {
    it("有効な認証情報でログインできる", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signIn("test@example.com", "password123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.id).toBe("user-123");
      }
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("無効なメールアドレスではログインに失敗する", async () => {
      const result = await authService.signIn("invalid-email", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("有効なメールアドレスを入力してください");
      }
      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("空のパスワードではログインに失敗する", async () => {
      const result = await authService.signIn("test@example.com", "");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("パスワードを入力してください");
      }
      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("不正な認証情報でログインに失敗する", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: {
          message: "Invalid login credentials",
          status: 400,
        },
      });

      const result = await authService.signIn("test@example.com", "wrongpassword1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Invalid login credentials");
      }
    });
  });

  // =============================================
  // ログアウトのテスト
  // =============================================
  describe("ログアウト", () => {
    it("正常にログアウトできる", async () => {
      mockAuth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it("ログアウト時にSupabaseエラーが発生した場合、エラーを返す", async () => {
      mockAuth.signOut.mockResolvedValue({
        error: { message: "Session not found", status: 401 },
      });

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Session not found");
      }
    });
  });

  // =============================================
  // パスワードリセットのテスト
  // =============================================
  describe("パスワードリセット", () => {
    it("有効なメールアドレスでパスワードリセットメールを送信できる", async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await authService.resetPassword("test@example.com");

      expect(result.success).toBe(true);
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password"),
        })
      );
    });

    it("無効なメールアドレスではパスワードリセットに失敗する", async () => {
      const result = await authService.resetPassword("invalid-email");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("有効なメールアドレスを入力してください");
      }
      expect(mockAuth.resetPasswordForEmail).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // サインアップ → ログイン → ログアウト フローテスト
  // =============================================
  describe("サインアップ → ログイン → ログアウト フロー", () => {
    it("ユーザーがサインアップし、ログインし、ログアウトできる", async () => {
      const mockUser = {
        id: "user-456",
        email: "flow-test@example.com",
        created_at: new Date().toISOString(),
      };

      // Step 1: サインアップ
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const signUpResult = await authService.signUp(
        "flow-test@example.com",
        "securePassword1"
      );
      expect(signUpResult.success).toBe(true);

      // Step 2: ログイン
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const signInResult = await authService.signIn(
        "flow-test@example.com",
        "securePassword1"
      );
      expect(signInResult.success).toBe(true);
      if (signInResult.success) {
        expect(signInResult.data.user.id).toBe("user-456");
      }

      // Step 3: ログアウト
      mockAuth.signOut.mockResolvedValue({ error: null });

      const signOutResult = await authService.signOut();
      expect(signOutResult.success).toBe(true);
    });
  });

  // =============================================
  // 例外処理のテスト
  // =============================================
  describe("例外処理", () => {
    it("signUp で予期しない例外が発生した場合、適切にハンドリングする", async () => {
      mockAuth.signUp.mockRejectedValue(new Error("Network error"));

      const result = await authService.signUp("test@example.com", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Network error");
      }
    });

    it("signIn で予期しない例外が発生した場合、適切にハンドリングする", async () => {
      mockAuth.signInWithPassword.mockRejectedValue(
        new Error("Connection timeout")
      );

      const result = await authService.signIn("test@example.com", "password123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Connection timeout");
      }
    });
  });
});
