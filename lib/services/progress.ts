// 認証無効化により、Supabaseクライアントは使用していない
// 将来的に認証を再有効化する場合は、以下のインポートを復元すること
// import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    // 認証が無効化されている場合は常に成功として扱う
    return {
      success: true,
      data: undefined,
    };
  }

  async getProgressSummary(
    userId: string
  ): Promise<Result<ProgressSummary, ProgressError>> {
    // 認証が無効化されている場合は空のサマリーを返す
    return {
      success: true,
      data: {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        totalLearningTime: 0,
        recentActivity: [],
      },
    };
  }

  async calculateProgress(
    userId: string,
    courseId: string
  ): Promise<Result<number, ProgressError>> {
    // 認証が無効化されている場合は常に0を返す
    return {
      success: true,
      data: 0,
    };
  }

  async getLessonStatus(
    userId: string,
    lessonId: string
  ): Promise<Result<LessonStatus, ProgressError>> {
    // 認証が無効化されている場合は常に未完了として扱う
    return {
      success: true,
      data: {
        lessonId,
        completed: false,
        completedAt: null,
      },
    };
  }

  async saveHistory(
    userId: string,
    lessonId: string,
    duration: number
  ): Promise<Result<void, ProgressError>> {
    // 認証が無効化されている場合は常に成功として扱う
    return {
      success: true,
      data: undefined,
    };
  }
}

/**
 * ProgressService のシングルトンインスタンス
 */
export const progressService: ProgressService = new ProgressServiceImpl();
