import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * プロフィールエラーの型定義
 */
export type UserProfileError = {
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
 * オンボーディング状態の型定義
 */
export type OnboardingStatus = {
  onboarding_completed: boolean;
  learning_goal: string | null;
  experience_level: string | null;
};

/**
 * オンボーディング完了のパラメータ型定義
 */
export type CompleteOnboardingParams = {
  learning_goal: string;
  experience_level: string;
};

/**
 * UserProfileService インターフェース
 * 
 * ユーザープロフィール管理を抽象化し、オンボーディングページから利用可能なインターフェースを提供します。
 */
export interface UserProfileService {
  /**
   * 現在のユーザーのオンボーディング状態を取得します
   * 
   * @param userId - ユーザーID
   * @returns オンボーディング状態（成功時）またはエラー
   */
  getOnboardingStatus(
    userId: string
  ): Promise<Result<OnboardingStatus, UserProfileError>>;

  /**
   * オンボーディングを完了し、プロフィール情報を更新します
   * 
   * @param userId - ユーザーID
   * @param params - オンボーディング完了パラメータ（学習目標、経験レベル）
   * @returns 成功またはエラー
   */
  completeOnboarding(
    userId: string,
    params: CompleteOnboardingParams
  ): Promise<Result<void, UserProfileError>>;
}

/**
 * UserProfileService の実装
 */
class UserProfileServiceImpl implements UserProfileService {
  async getOnboardingStatus(
    userId: string
  ): Promise<Result<OnboardingStatus, UserProfileError>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, learning_goal, experience_level")
        .eq("id", userId)
        .single();

      if (error) {
        // プロフィールが存在しない場合
        if (error.code === "PGRST116") {
          return {
            success: false,
            error: {
              message: "プロフィールが見つかりません",
              code: "PROFILE_NOT_FOUND",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "プロフィールの取得に失敗しました",
            code: error.code || "UNKNOWN_ERROR",
          },
        };
      }

      if (!data) {
        return {
          success: false,
          error: {
            message: "プロフィールが見つかりません",
            code: "PROFILE_NOT_FOUND",
          },
        };
      }

      return {
        success: true,
        data: {
          onboarding_completed: (data as { onboarding_completed: boolean }).onboarding_completed,
          learning_goal: (data as { learning_goal: string | null }).learning_goal,
          experience_level: (data as { experience_level: string | null }).experience_level,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "プロフィールの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async completeOnboarding(
    userId: string,
    params: CompleteOnboardingParams
  ): Promise<Result<void, UserProfileError>> {
    try {
      // パラメータの検証
      if (!params.learning_goal || params.learning_goal.trim() === "") {
        return {
          success: false,
          error: {
            message: "学習目標を入力してください",
            code: "VALIDATION_ERROR",
          },
        };
      }

      if (!params.experience_level || params.experience_level.trim() === "") {
        return {
          success: false,
          error: {
            message: "経験レベルを選択してください",
            code: "VALIDATION_ERROR",
          },
        };
      }

      const supabase = await createServerSupabaseClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          learning_goal: params.learning_goal.trim(),
          experience_level: params.experience_level.trim(),
        } as never)
        .eq("id", userId);

      if (error) {
        // RLS ポリシー違反の可能性
        if (error.code === "42501") {
          return {
            success: false,
            error: {
              message: "プロフィールの更新権限がありません",
              code: "PERMISSION_DENIED",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "プロフィールの更新に失敗しました",
            code: error.code || "UNKNOWN_ERROR",
          },
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "プロフィールの更新中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }
}

/**
 * UserProfileService のシングルトンインスタンス
 */
export const userProfileService: UserProfileService =
  new UserProfileServiceImpl();
