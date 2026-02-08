import { createServerSupabaseClient } from "@/lib/supabase/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { unstable_cache } from "next/cache";

/**
 * コンテンツエラーの型定義
 */
export type ContentError = {
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
 * コースの型定義
 */
export type Course = {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
};

/**
 * セクションの型定義
 */
export type Section = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
};

/**
 * レッスンの型定義
 */
export type Lesson = {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  contentPath: string;
  orderIndex: number;
  createdAt: string;
};

/**
 * ContentService インターフェース
 * 
 * 学習コンテンツ（コース・セクション・レッスン）の取得と階層構造管理を抽象化します。
 */
export interface ContentService {
  /**
   * すべてのコースを取得します
   * 
   * @returns コース一覧（成功時）またはエラー
   */
  listCourses(): Promise<Result<Course[], ContentError>>;

  /**
   * コース詳細を取得します
   * 
   * @param courseId - コースID
   * @returns コース詳細（成功時）またはエラー
   */
  getCourse(courseId: string): Promise<Result<Course | null, ContentError>>;

  /**
   * レッスンメタデータを取得します
   * 
   * @param courseId - コースID
   * @param sectionId - セクションID
   * @param lessonId - レッスンID
   * @returns レッスンメタデータ（成功時）またはエラー
   */
  getLesson(
    courseId: string,
    sectionId: string,
    lessonId: string
  ): Promise<Result<Lesson | null, ContentError>>;

  /**
   * レッスンのMDXコンテンツを取得します
   * 
   * @param lessonId - レッスンID
   * @returns MDXソース文字列（成功時）またはエラー
   */
  getLessonContent(lessonId: string): Promise<Result<string, ContentError>>;

  /**
   * ユーザーの進捗に基づいて推奨レッスンを取得します
   * 
   * @param userId - ユーザーID
   * @returns 推奨レッスン一覧（成功時）またはエラー
   */
  getRecommendedLessons(
    userId: string
  ): Promise<Result<Lesson[], ContentError>>;

  /**
   * AIコンテキスト用にレッスン内容を取得します
   * 
   * @param lessonId - レッスンID
   * @returns レッスンコンテキスト文字列（成功時）またはエラー
   */
  getLessonContext(lessonId: string): Promise<Result<string, ContentError>>;

  /**
   * コースに属するセクションとレッスン一覧を取得します
   * 
   * @param courseId - コースID
   * @returns セクションとレッスンの階層構造（成功時）またはエラー
   */
  getCourseWithSectionsAndLessons(
    courseId: string
  ): Promise<Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>>;
}

/**
 * ContentService の実装
 */
class ContentServiceImpl implements ContentService {
  /**
   * MDXコンテンツのベースパス
   */
  private readonly CONTENT_BASE_PATH = join(process.cwd(), "content", "lessons");

  async listCourses(): Promise<Result<Course[], ContentError>> {
    // ISR: コース一覧を60秒間キャッシュ（ユーザー非依存データ）
    return unstable_cache(
      async () => {
        try {
          const supabase = await createServerSupabaseClient();

          const { data, error } = await supabase
            .from("courses")
            .select("*")
            .order("order_index", { ascending: true });

          if (error) {
            return {
              success: false,
              error: {
                message: "コース一覧の取得に失敗しました",
                code: error.code || "UNKNOWN_ERROR",
              },
            } as Result<Course[], ContentError>;
          }

          const courses: Course[] =
            data?.map((c) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              orderIndex: c.order_index,
              createdAt: c.created_at,
            })) || [];

          return {
            success: true,
            data: courses,
          } as Result<Course[], ContentError>;
        } catch (error) {
          return {
            success: false,
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "コース一覧の取得中に予期しないエラーが発生しました",
              code: "UNKNOWN_ERROR",
            },
          } as Result<Course[], ContentError>;
        }
      },
      ["courses-list"],
      {
        revalidate: 60, // 60秒間キャッシュ
        tags: ["courses"],
      }
    )();
  }

  async getCourse(courseId: string): Promise<Result<Course | null, ContentError>> {
    // ISR: コース詳細を60秒間キャッシュ（ユーザー非依存データ）
    return unstable_cache(
      async () => {
        try {
          const supabase = await createServerSupabaseClient();

          const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", courseId)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              // コースが見つからない場合
              return {
                success: true,
                data: null,
              } as Result<Course | null, ContentError>;
            }

            return {
              success: false,
              error: {
                message: "コース詳細の取得に失敗しました",
                code: error.code || "UNKNOWN_ERROR",
              },
            } as Result<Course | null, ContentError>;
          }

          if (!data) {
            return {
              success: true,
              data: null,
            } as Result<Course | null, ContentError>;
          }

          return {
            success: true,
            data: {
              id: data.id,
              title: data.title,
              description: data.description,
              orderIndex: data.order_index,
              createdAt: data.created_at,
            },
          } as Result<Course | null, ContentError>;
        } catch (error) {
          return {
            success: false,
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "コース詳細の取得中に予期しないエラーが発生しました",
              code: "UNKNOWN_ERROR",
            },
          } as Result<Course | null, ContentError>;
        }
      },
      [`course-${courseId}`],
      {
        revalidate: 60, // 60秒間キャッシュ
        tags: ["courses", `course-${courseId}`],
      }
    )();
  }

  async getLesson(
    courseId: string,
    sectionId: string,
    lessonId: string
  ): Promise<Result<Lesson | null, ContentError>> {
    // ISR: レッスンメタデータを60秒間キャッシュ（ユーザー非依存データ）
    return unstable_cache(
      async () => {
        try {
          const supabase = await createServerSupabaseClient();

          // セクションがコースに属しているか確認
          const { data: section, error: sectionError } = await supabase
            .from("sections")
            .select("course_id")
            .eq("id", sectionId)
            .single();

          if (sectionError || !section || section.course_id !== courseId) {
            return {
              success: false,
              error: {
                message: "セクションが見つからないか、コースに属していません",
                code: "SECTION_NOT_FOUND",
              },
            } as Result<Lesson | null, ContentError>;
          }

          // レッスンを取得
          const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", lessonId)
            .eq("section_id", sectionId)
            .single();

          if (lessonError) {
            if (lessonError.code === "PGRST116") {
              return {
                success: true,
                data: null,
              } as Result<Lesson | null, ContentError>;
            }

            return {
              success: false,
              error: {
                message: "レッスンの取得に失敗しました",
                code: lessonError.code || "UNKNOWN_ERROR",
              },
            } as Result<Lesson | null, ContentError>;
          }

          if (!lesson) {
            return {
              success: true,
              data: null,
            } as Result<Lesson | null, ContentError>;
          }

          return {
            success: true,
            data: {
              id: lesson.id,
              sectionId: lesson.section_id,
              courseId: courseId,
              title: lesson.title,
              contentPath: lesson.content_path,
              orderIndex: lesson.order_index,
              createdAt: lesson.created_at,
            },
          } as Result<Lesson | null, ContentError>;
        } catch (error) {
          return {
            success: false,
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "レッスンの取得中に予期しないエラーが発生しました",
              code: "UNKNOWN_ERROR",
            },
          } as Result<Lesson | null, ContentError>;
        }
      },
      [`lesson-${courseId}-${sectionId}-${lessonId}`],
      {
        revalidate: 60, // 60秒間キャッシュ
        tags: ["lessons", `lesson-${lessonId}`],
      }
    )();
  }

  async getLessonContent(
    lessonId: string
  ): Promise<Result<string, ContentError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // レッスンのメタデータを取得
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("content_path")
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

      // MDXファイルを読み込む
      // content_path が相対パスの場合、ベースパスと結合
      const filePath = lesson.content_path.startsWith("/")
        ? join(process.cwd(), lesson.content_path)
        : join(this.CONTENT_BASE_PATH, lesson.content_path);

      try {
        const content = await readFile(filePath, "utf-8");
        return {
          success: true,
          data: content,
        };
      } catch (fileError) {
        return {
          success: false,
          error: {
            message:
              fileError instanceof Error
                ? `MDXファイルの読み込みに失敗しました: ${fileError.message}`
                : "MDXファイルの読み込みに失敗しました",
            code: "FILE_READ_ERROR",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "レッスンコンテンツの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getRecommendedLessons(
    userId: string
  ): Promise<Result<Lesson[], ContentError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // 完了済みレッスンIDを取得
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

      const completedLessonIds = new Set(
        completedLessons?.map((l) => l.lesson_id) || []
      );

      // すべてのレッスンを取得（order_index順）
      const { data: allLessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("*, sections!inner(course_id)")
        .order("order_index", { ascending: true });

      if (lessonsError) {
        return {
          success: false,
          error: {
            message: "レッスン一覧の取得に失敗しました",
            code: lessonsError.code || "UNKNOWN_ERROR",
          },
        };
      }

      // 未完了のレッスンを推奨レッスンとして返す（最大10件）
      const recommendedLessons: Lesson[] = [];
      for (const lesson of allLessons || []) {
        if (!completedLessonIds.has(lesson.id)) {
          const section = lesson.sections as { course_id: string };
          recommendedLessons.push({
            id: lesson.id,
            sectionId: lesson.section_id,
            courseId: section.course_id,
            title: lesson.title,
            contentPath: lesson.content_path,
            orderIndex: lesson.order_index,
            createdAt: lesson.created_at,
          });

          if (recommendedLessons.length >= 10) {
            break;
          }
        }
      }

      return {
        success: true,
        data: recommendedLessons,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "推奨レッスンの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getLessonContext(
    lessonId: string
  ): Promise<Result<string, ContentError>> {
    try {
      // レッスンコンテンツを取得
      const contentResult = await this.getLessonContent(lessonId);

      if (!contentResult.success) {
        return contentResult;
      }

      // レッスンメタデータも取得してコンテキストに含める
      const supabase = await createServerSupabaseClient();
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("title, sections!inner(title, courses!inner(title))")
        .eq("id", lessonId)
        .single();

      let context = contentResult.data;

      if (!lessonError && lesson) {
        const section = lesson.sections as {
          title: string;
          courses: { title: string };
        };
        const courseTitle = section.courses.title;
        const sectionTitle = section.title;
        const lessonTitle = lesson.title;

        // メタデータをコンテキストに追加
        context = `# ${courseTitle} > ${sectionTitle} > ${lessonTitle}\n\n${context}`;
      }

      return {
        success: true,
        data: context,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "レッスンコンテキストの取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getCourseWithSectionsAndLessons(
    courseId: string
  ): Promise<Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>> {
    // ISR: コース情報とセクション・レッスン一覧を60秒間キャッシュ（ユーザー非依存データ）
    return unstable_cache(
      async () => {
        try {
          const supabase = await createServerSupabaseClient();

          // コース情報を取得
          const courseResult = await this.getCourse(courseId);
          if (!courseResult.success || !courseResult.data) {
            return {
              success: true,
              data: null,
            } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
          }

          // セクション一覧を取得
          const { data: sectionsData, error: sectionsError } = await supabase
            .from("sections")
            .select("*")
            .eq("course_id", courseId)
            .order("order_index", { ascending: true });

          if (sectionsError) {
            return {
              success: false,
              error: {
                message: "セクション一覧の取得に失敗しました",
                code: sectionsError.code || "UNKNOWN_ERROR",
              },
            } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
          }

          const sectionIds = sectionsData?.map((s) => s.id) || [];
          if (sectionIds.length === 0) {
            return {
              success: true,
              data: {
                course: courseResult.data,
                sections: [],
              },
            } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
          }

          // レッスン一覧を取得
          const { data: lessonsData, error: lessonsError } = await supabase
            .from("lessons")
            .select("*")
            .in("section_id", sectionIds)
            .order("order_index", { ascending: true });

          if (lessonsError) {
            return {
              success: false,
              error: {
                message: "レッスン一覧の取得に失敗しました",
                code: lessonsError.code || "UNKNOWN_ERROR",
              },
            } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
          }

          // セクションごとにレッスンをグループ化
          const sections: Array<Section & { lessons: Lesson[] }> =
            sectionsData?.map((section) => ({
              id: section.id,
              courseId: section.course_id,
              title: section.title,
              orderIndex: section.order_index,
              createdAt: section.created_at,
              lessons:
                lessonsData
                  ?.filter((lesson) => lesson.section_id === section.id)
                  .map((lesson) => ({
                    id: lesson.id,
                    sectionId: lesson.section_id,
                    courseId: courseId,
                    title: lesson.title,
                    contentPath: lesson.content_path,
                    orderIndex: lesson.order_index,
                    createdAt: lesson.created_at,
                  })) || [],
            })) || [];

          return {
            success: true,
            data: {
              course: courseResult.data,
              sections,
            },
          } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
        } catch (error) {
          return {
            success: false,
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "コース情報の取得中に予期しないエラーが発生しました",
              code: "UNKNOWN_ERROR",
            },
          } as Result<{ course: Course; sections: Array<Section & { lessons: Lesson[] }> } | null, ContentError>;
        }
      },
      [`course-with-sections-${courseId}`],
      {
        revalidate: 60, // 60秒間キャッシュ
        tags: ["courses", `course-${courseId}`, "sections", "lessons"],
      }
    )();
  }
}

/**
 * ContentService のシングルトンインスタンス
 */
export const contentService: ContentService = new ContentServiceImpl();
