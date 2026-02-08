import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * 進捗エラーの型定義
 */
export type ProgressError = {
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
 * 進捗サマリーの型定義
 */
export type ProgressSummary = {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalLearningTime: number; // 秒単位
  recentActivity: RecentActivity[];
};

/**
 * 最近の活動の型定義
 */
export type RecentActivity = {
  lessonId: string;
  lessonTitle: string;
  accessedAt: string;
  duration: number; // 秒単位
};

/**
 * レッスンステータスの型定義
 */
export type LessonStatus = {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
};

/**
 * ProgressService インターフェース
 * 
 * ユーザーの学習進捗（レッスン完了・進捗率・学習履歴）の管理を抽象化します。
 */
export interface ProgressService {
  /**
   * レッスンを完了として記録します
   * 
   * @param userId - ユーザーID
   * @param lessonId - レッスンID
   * @returns 成功またはエラー
   */
  completeLesson(
    userId: string,
    lessonId: string
  ): Promise<Result<void, ProgressError>>;

  /**
   * ユーザーの進捗サマリーを取得します
   * 
   * @param userId - ユーザーID
   * @returns 進捗サマリー（成功時）またはエラー
   */
  getProgressSummary(
    userId: string
  ): Promise<Result<ProgressSummary, ProgressError>>;

  /**
   * コースごとの進捗率を算出します
   * 
   * @param userId - ユーザーID
   * @param courseId - コースID
   * @returns 進捗率（0-100）（成功時）またはエラー
   */
  calculateProgress(
    userId: string,
    courseId: string
  ): Promise<Result<number, ProgressError>>;

  /**
   * レッスンの完了/未完了ステータスを取得します
   * 
   * @param userId - ユーザーID
   * @param lessonId - レッスンID
   * @returns レッスンステータス（成功時）またはエラー
   */
  getLessonStatus(
    userId: string,
    lessonId: string
  ): Promise<Result<LessonStatus, ProgressError>>;

  /**
   * 学習履歴を保存します
   * 
   * @param userId - ユーザーID
   * @param lessonId - レッスンID
   * @param duration - 学習時間（秒）
   * @returns 成功またはエラー
   */
  saveHistory(
    userId: string,
    lessonId: string,
    duration: number
  ): Promise<Result<void, ProgressError>>;
}

/**
 * ProgressService の実装
 */
class ProgressServiceImpl implements ProgressService {
  async completeLesson(
    userId: string,
    lessonId: string
  ): Promise<Result<void, ProgressError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // レッスンが存在するか確認
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("id")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lesson) {
        return {
          success: false,
          error: {
            message: "レッスンが見つかりません",
            code: "LESSON_NOT_FOUND",
          },
        };
      }

      // 既に完了済みかチェック
      const { data: existing } = await supabase
        .from("lesson_completions")
        .select("id")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        // 既に完了済みの場合は成功として扱う（冪等性）
        return {
          success: true,
          data: undefined,
        };
      }

      // レッスン完了を記録
      const { error } = await supabase.from("lesson_completions").insert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        // 重複エラー（23505）の場合は成功として扱う
        if (error.code === "23505") {
          return {
            success: true,
            data: undefined,
          };
        }

        // RLS ポリシー違反の可能性
        if (error.code === "42501") {
          return {
            success: false,
            error: {
              message: "レッスン完了の記録権限がありません",
              code: "PERMISSION_DENIED",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "レッスン完了の記録に失敗しました",
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
              : "レッスン完了の記録中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getProgressSummary(
    userId: string
  ): Promise<Result<ProgressSummary, ProgressError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // 全レッスン数を取得
      const { data: allLessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id");

      if (lessonsError) {
        return {
          success: false,
          error: {
            message: "レッスン情報の取得に失敗しました",
            code: lessonsError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const totalLessons = allLessons?.length || 0;

      // 完了レッスン数を取得
      const { data: completedLessons, error: completedError } = await supabase
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", userId);

      if (completedError) {
        return {
          success: false,
          error: {
            message: "進捗情報の取得に失敗しました",
            code: completedError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const completedCount = completedLessons?.length || 0;
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // 学習履歴から総学習時間を取得
      const { data: history, error: historyError } = await supabase
        .from("learning_history")
        .select("duration_seconds")
        .eq("user_id", userId);

      if (historyError) {
        return {
          success: false,
          error: {
            message: "学習履歴の取得に失敗しました",
            code: historyError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const totalLearningTime =
        history?.reduce((sum, h) => sum + (h.duration_seconds || 0), 0) || 0;

      // 最近の活動を取得（最新10件）
      const { data: recentHistory, error: recentError } = await supabase
        .from("learning_history")
        .select(
          "lesson_id, accessed_at, duration_seconds, lessons!inner(title)"
        )
        .eq("user_id", userId)
        .order("accessed_at", { ascending: false })
        .limit(10);

      const recentActivity: RecentActivity[] = [];
      if (!recentError && recentHistory) {
        for (const item of recentHistory) {
          const lesson = item.lessons as { title: string };
          recentActivity.push({
            lessonId: item.lesson_id,
            lessonTitle: lesson?.title || "不明なレッスン",
            accessedAt: item.accessed_at,
            duration: item.duration_seconds || 0,
          });
        }
      }

      return {
        success: true,
        data: {
          totalLessons,
          completedLessons: completedCount,
          progressPercentage,
          totalLearningTime,
          recentActivity,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "進捗サマリーの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async calculateProgress(
    userId: string,
    courseId: string
  ): Promise<Result<number, ProgressError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // コースが存在するか確認
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        return {
          success: false,
          error: {
            message: "コースが見つかりません",
            code: "COURSE_NOT_FOUND",
          },
        };
      }

      // コースに属する全レッスン数を取得
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id")
        .eq("sections.course_id", courseId);

      // 上記のクエリが動作しない可能性があるため、セクション経由で取得
      const { data: sections, error: sectionsError } = await supabase
        .from("sections")
        .select("id")
        .eq("course_id", courseId);

      if (sectionsError) {
        return {
          success: false,
          error: {
            message: "セクション情報の取得に失敗しました",
            code: sectionsError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const sectionIds = sections?.map((s) => s.id) || [];
      if (sectionIds.length === 0) {
        return {
          success: true,
          data: 0, // レッスンが存在しない場合は0%
        };
      }

      const { data: courseLessons, error: courseLessonsError } = await supabase
        .from("lessons")
        .select("id")
        .in("section_id", sectionIds);

      if (courseLessonsError) {
        return {
          success: false,
          error: {
            message: "レッスン情報の取得に失敗しました",
            code: courseLessonsError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const totalLessons = courseLessons?.length || 0;
      if (totalLessons === 0) {
        return {
          success: true,
          data: 0,
        };
      }

      // 完了レッスン数を取得
      const lessonIds = courseLessons.map((l) => l.id);
      const { data: completedLessons, error: completedError } = await supabase
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);

      if (completedError) {
        return {
          success: false,
          error: {
            message: "進捗情報の取得に失敗しました",
            code: completedError.code || "UNKNOWN_ERROR",
          },
        };
      }

      const completedCount = completedLessons?.length || 0;
      const progressPercentage = Math.round(
        (completedCount / totalLessons) * 100
      );

      return {
        success: true,
        data: progressPercentage,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "進捗率の算出中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getLessonStatus(
    userId: string,
    lessonId: string
  ): Promise<Result<LessonStatus, ProgressError>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data: completion, error } = await supabase
        .from("lesson_completions")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 は「行が見つからない」エラー（正常）
        return {
          success: false,
          error: {
            message: "レッスンステータスの取得に失敗しました",
            code: error.code || "UNKNOWN_ERROR",
          },
        };
      }

      return {
        success: true,
        data: {
          lessonId,
          completed: !!completion,
          completedAt: completion?.completed_at || null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "レッスンステータスの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async saveHistory(
    userId: string,
    lessonId: string,
    duration: number
  ): Promise<Result<void, ProgressError>> {
    try {
      // パラメータの検証
      if (duration < 0) {
        return {
          success: false,
          error: {
            message: "学習時間は0以上である必要があります",
            code: "VALIDATION_ERROR",
          },
        };
      }

      const supabase = await createServerSupabaseClient();

      // レッスンが存在するか確認
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("id")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lesson) {
        return {
          success: false,
          error: {
            message: "レッスンが見つかりません",
            code: "LESSON_NOT_FOUND",
          },
        };
      }

      // 学習履歴を保存
      const { error } = await supabase.from("learning_history").insert({
        user_id: userId,
        lesson_id: lessonId,
        duration_seconds: duration,
        accessed_at: new Date().toISOString(),
      });

      if (error) {
        // RLS ポリシー違反の可能性
        if (error.code === "42501") {
          return {
            success: false,
            error: {
              message: "学習履歴の保存権限がありません",
              code: "PERMISSION_DENIED",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "学習履歴の保存に失敗しました",
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
              : "学習履歴の保存中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }
}

/**
 * ProgressService のシングルトンインスタンス
 */
export const progressService: ProgressService = new ProgressServiceImpl();
