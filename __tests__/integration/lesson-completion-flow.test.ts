/**
 * 統合テスト: レッスン完了フロー
 *
 * レッスン表示 → 完了記録 → 進捗更新 のフローをテストします。
 * Supabase をモックして、ProgressService の各メソッドを検証します。
 *
 * Requirements: 4.4, 6.1
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock はホイストされるため、vi.hoisted() で変数を先に定義
const { mockSupabaseClient, setFromResults, resetFromCounts } = vi.hoisted(() => {
  let fromResults: Record<string, Array<{ data: unknown; error: unknown }>> = {};
  let fromCallCounts: Record<string, number> = {};

  function createChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = [
      "select", "insert", "update", "delete",
      "eq", "neq", "in", "order", "limit",
    ];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain["single"] = vi.fn().mockResolvedValue(result);
    chain["maybeSingle"] = vi.fn().mockResolvedValue(result);
    (chain as unknown as { then: unknown }).then = (
      resolve: (v: unknown) => void
    ) => Promise.resolve(result).then(resolve);
    return chain;
  }

  const mockSupabaseClient = {
    auth: { getUser: vi.fn() },
    from: vi.fn((table: string) => {
      if (!fromCallCounts[table]) fromCallCounts[table] = 0;
      const results = fromResults[table] || [{ data: null, error: null }];
      const idx = Math.min(fromCallCounts[table], results.length - 1);
      fromCallCounts[table]++;
      return createChain(results[idx]);
    }),
  };

  return {
    mockSupabaseClient,
    setFromResults: (r: Record<string, Array<{ data: unknown; error: unknown }>>) => {
      fromResults = r;
    },
    resetFromCounts: () => {
      fromCallCounts = {};
    },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

import { progressService } from "@/lib/services/progress";

describe("レッスン完了フロー統合テスト", () => {
  const userId = "user-001";
  const lessonId = "lesson-001";
  const courseId = "course-001";

  beforeEach(() => {
    vi.clearAllMocks();
    setFromResults({});
    resetFromCounts();
  });

  // =============================================
  // レッスン完了の記録
  // =============================================
  describe("レッスン完了の記録 (completeLesson)", () => {
    it("レッスンを正常に完了記録できる", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        lesson_completions: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
          { data: null, error: null },
        ],
      });

      const result = await progressService.completeLesson(userId, lessonId);
      expect(result.success).toBe(true);
    });

    it("既に完了済みのレッスンを再度完了記録しても成功する（冪等性）", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        lesson_completions: [
          { data: { id: "comp-001" }, error: null },
        ],
      });

      const result = await progressService.completeLesson(userId, lessonId);
      expect(result.success).toBe(true);
    });

    it("存在しないレッスンの完了記録に失敗する", async () => {
      setFromResults({
        lessons: [{ data: null, error: { code: "PGRST116", message: "not found" } }],
      });

      const result = await progressService.completeLesson(userId, "nonexistent");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("レッスンが見つかりません");
        expect(result.error.code).toBe("LESSON_NOT_FOUND");
      }
    });

    it("重複挿入エラー（23505）が発生しても成功として扱う", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        lesson_completions: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
          { data: null, error: { code: "23505", message: "duplicate" } },
        ],
      });

      const result = await progressService.completeLesson(userId, lessonId);
      expect(result.success).toBe(true);
    });

    it("RLSポリシー違反時に適切なエラーを返す", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        lesson_completions: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
          { data: null, error: { code: "42501", message: "permission denied" } },
        ],
      });

      const result = await progressService.completeLesson(userId, lessonId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PERMISSION_DENIED");
      }
    });
  });

  // =============================================
  // 進捗サマリーの取得
  // =============================================
  describe("進捗サマリーの取得 (getProgressSummary)", () => {
    it("進捗サマリーを正常に取得できる", async () => {
      setFromResults({
        lessons: [
          { data: [{ id: "l1" }, { id: "l2" }, { id: "l3" }], error: null },
        ],
        lesson_completions: [
          { data: [{ lesson_id: "l1" }], error: null },
        ],
        learning_history: [
          { data: [{ duration_seconds: 300 }, { duration_seconds: 600 }], error: null },
          {
            data: [
              {
                lesson_id: "l1",
                accessed_at: "2025-01-01T00:00:00Z",
                duration_seconds: 300,
                lessons: { title: "レッスン1" },
              },
            ],
            error: null,
          },
        ],
      });

      const result = await progressService.getProgressSummary(userId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalLessons).toBe(3);
        expect(result.data.completedLessons).toBe(1);
        expect(result.data.progressPercentage).toBe(33);
        expect(result.data.totalLearningTime).toBe(900);
        expect(result.data.recentActivity).toHaveLength(1);
        expect(result.data.recentActivity[0].lessonTitle).toBe("レッスン1");
      }
    });

    it("レッスンがゼロの場合、進捗率は0%", async () => {
      setFromResults({
        lessons: [{ data: [], error: null }],
        lesson_completions: [{ data: [], error: null }],
        learning_history: [
          { data: [], error: null },
          { data: [], error: null },
        ],
      });

      const result = await progressService.getProgressSummary(userId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalLessons).toBe(0);
        expect(result.data.progressPercentage).toBe(0);
      }
    });

    it("レッスン取得エラー時に適切なエラーを返す", async () => {
      setFromResults({
        lessons: [
          { data: null, error: { code: "PGRST000", message: "DB error" } },
        ],
      });

      const result = await progressService.getProgressSummary(userId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("レッスン情報の取得に失敗しました");
      }
    });
  });

  // =============================================
  // コースごとの進捗率
  // =============================================
  describe("コース進捗率の算出 (calculateProgress)", () => {
    it("コースの進捗率を正常に算出できる", async () => {
      setFromResults({
        courses: [{ data: { id: courseId }, error: null }],
        sections: [
          { data: [{ id: "s1" }, { id: "s2" }], error: null },
        ],
        lessons: [
          { data: null, error: null },
          { data: [{ id: "l1" }, { id: "l2" }, { id: "l3" }, { id: "l4" }], error: null },
        ],
        lesson_completions: [
          { data: [{ lesson_id: "l1" }, { lesson_id: "l2" }], error: null },
        ],
      });

      const result = await progressService.calculateProgress(userId, courseId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(50);
      }
    });

    it("存在しないコースの場合エラーを返す", async () => {
      setFromResults({
        courses: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await progressService.calculateProgress(userId, "nonexistent");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("COURSE_NOT_FOUND");
      }
    });

    it("セクションがないコースの場合、進捗率0%を返す", async () => {
      setFromResults({
        courses: [{ data: { id: courseId }, error: null }],
        sections: [{ data: [], error: null }],
        lessons: [{ data: null, error: null }],
      });

      const result = await progressService.calculateProgress(userId, courseId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });
  });

  // =============================================
  // レッスンステータスの取得
  // =============================================
  describe("レッスンステータスの取得 (getLessonStatus)", () => {
    it("完了済みレッスンのステータスを取得できる", async () => {
      setFromResults({
        lesson_completions: [
          {
            data: { completed_at: "2025-01-15T10:30:00Z" },
            error: null,
          },
        ],
      });

      const result = await progressService.getLessonStatus(userId, lessonId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(true);
        expect(result.data.completedAt).toBe("2025-01-15T10:30:00Z");
        expect(result.data.lessonId).toBe(lessonId);
      }
    });

    it("未完了レッスンのステータスを取得できる", async () => {
      setFromResults({
        lesson_completions: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await progressService.getLessonStatus(userId, lessonId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(false);
        expect(result.data.completedAt).toBeNull();
      }
    });

    it("DB エラー時に適切なエラーを返す", async () => {
      setFromResults({
        lesson_completions: [
          { data: null, error: { code: "PGRST000", message: "DB error" } },
        ],
      });

      const result = await progressService.getLessonStatus(userId, lessonId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("レッスンステータスの取得に失敗しました");
      }
    });
  });

  // =============================================
  // 学習履歴の保存
  // =============================================
  describe("学習履歴の保存 (saveHistory)", () => {
    it("学習履歴を正常に保存できる", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        learning_history: [{ data: null, error: null }],
      });

      const result = await progressService.saveHistory(userId, lessonId, 600);
      expect(result.success).toBe(true);
    });

    it("負の学習時間で保存に失敗する", async () => {
      const result = await progressService.saveHistory(userId, lessonId, -10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("存在しないレッスンの学習履歴保存に失敗する", async () => {
      setFromResults({
        lessons: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await progressService.saveHistory(userId, "nonexistent", 300);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LESSON_NOT_FOUND");
      }
    });

    it("RLSポリシー違反時に適切なエラーを返す", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        learning_history: [
          { data: null, error: { code: "42501", message: "permission denied" } },
        ],
      });

      const result = await progressService.saveHistory(userId, lessonId, 300);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PERMISSION_DENIED");
      }
    });
  });

  // =============================================
  // レッスン完了 → 進捗確認 フローテスト
  // =============================================
  describe("レッスン完了 → 進捗確認 フロー", () => {
    it("レッスン完了後に進捗が更新される", async () => {
      setFromResults({
        lessons: [
          { data: { id: lessonId }, error: null },
          { data: [{ id: "l1" }, { id: "l2" }], error: null },
        ],
        lesson_completions: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
          { data: null, error: null },
          { data: [{ lesson_id: "l1" }], error: null },
        ],
        learning_history: [
          { data: [{ duration_seconds: 300 }], error: null },
          { data: [], error: null },
        ],
      });

      const completeResult = await progressService.completeLesson(userId, lessonId);
      expect(completeResult.success).toBe(true);

      const summaryResult = await progressService.getProgressSummary(userId);
      expect(summaryResult.success).toBe(true);
      if (summaryResult.success) {
        expect(summaryResult.data.completedLessons).toBeGreaterThan(0);
      }
    });
  });
});
