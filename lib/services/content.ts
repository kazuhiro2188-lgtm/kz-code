import { readFile } from "fs/promises";
import { join } from "path";
import {
  staticCourses,
  staticLessons,
  staticSections,
  getCourseById,
  getSectionsByCourseId,
  getLessonsBySectionId,
  getLessonById,
  getLesson as getStaticLesson,
} from "@/lib/data/courses";

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
    // 静的コースデータを返す
    return {
      success: true,
      data: staticCourses.sort((a, b) => a.orderIndex - b.orderIndex),
    };
  }

  async getCourse(courseId: string): Promise<Result<Course | null, ContentError>> {
    // 静的コースデータから取得
    const course = getCourseById(courseId);
    return {
      success: true,
      data: course,
    };
  }

  async getLesson(
    courseId: string,
    sectionId: string,
    lessonId: string
  ): Promise<Result<Lesson | null, ContentError>> {
    // 静的レッスンデータから取得
    const lesson = getStaticLesson(courseId, sectionId, lessonId);
    return {
      success: true,
      data: lesson,
    };
  }

  async getLessonContent(
    lessonId: string
  ): Promise<Result<string, ContentError>> {
    try {
      // 静的レッスンデータから取得
      const lesson = getLessonById(lessonId);
      
      if (!lesson) {
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
      const contentPath = lesson.contentPath;
      const filePath = contentPath.startsWith("/")
        ? join(process.cwd(), contentPath)
        : join(this.CONTENT_BASE_PATH, contentPath);

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
    // 認証が無効化されている場合は空の配列を返す
    // 静的データからすべてのレッスンを返す（簡易実装）
    return {
      success: true,
      data: staticLessons.slice(0, 10), // 最初の10件を返す
    };
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
      const lesson = getLessonById(lessonId);
      let context = contentResult.data;

      if (lesson) {
        // セクションとコース情報を取得
        const section = getSectionsByCourseId(lesson.courseId).find(
          (s) => s.id === lesson.sectionId
        );
        const course = getCourseById(lesson.courseId);

        if (section && course) {
          // メタデータをコンテキストに追加
          context = `# ${course.title} > ${section.title} > ${lesson.title}\n\n${context}`;
        }
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
    try {
      // 静的コースデータから取得
      const course = getCourseById(courseId);
      
      if (!course) {
        return {
          success: true,
          data: null,
        };
      }

      // セクション一覧を取得
      const sectionsData = getSectionsByCourseId(courseId);

      // 各セクションのレッスン一覧を取得
      const sections: Array<Section & { lessons: Lesson[] }> = sectionsData.map((section) => {
        const lessons = getLessonsBySectionId(section.id);
        return {
          ...section,
          lessons,
        };
      });

      return {
        success: true,
        data: {
          course,
          sections,
        },
      };
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
      };
    }
  }
}

/**
 * ContentService のシングルトンインスタンス
 */
export const contentService: ContentService = new ContentServiceImpl();
