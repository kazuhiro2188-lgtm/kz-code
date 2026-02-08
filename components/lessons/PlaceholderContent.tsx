import Link from "next/link";
import type { Lesson } from "@/lib/services/content";

type PlaceholderContentProps = {
  lesson: Lesson;
};

/**
 * PlaceholderContent コンポーネント
 * 
 * MDXファイルが存在しない場合に表示するプレースホルダーコンテンツ
 */
export default function PlaceholderContent({ lesson }: PlaceholderContentProps) {
  return (
    <div className="space-y-6">
      {/* 注意メッセージ */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              コンテンツ準備中
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400">
              このレッスンのコンテンツは現在準備中です。しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>

      {/* レッスン情報 */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          レッスン情報
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              レッスンID
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">
              {lesson.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              コンテンツパス
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">
              {lesson.contentPath}
            </dd>
          </div>
        </dl>
      </div>

      {/* 次のステップ */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
          次のステップ
        </h3>
        <ul className="space-y-2">
          <li>
            <Link
              href={`/courses/${lesson.courseId}`}
              className="flex items-start gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>コース一覧に戻る</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="flex items-start gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>ダッシュボードに戻る</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
