import type { ProgressSummary } from "@/lib/services/progress";

/**
 * ProgressSummary コンポーネントの Props
 */
type ProgressSummaryProps = {
  summary: ProgressSummary;
};

/**
 * 秒を時間と分に変換します
 */
function formatLearningTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

/**
 * 進捗サマリー表示コンポーネント
 * 
 * 完了率、学習時間、達成項目を表示します。
 */
export default function ProgressSummaryCard({ summary }: ProgressSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        学習進捗
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 完了率 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {summary.progressPercentage}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            完了率
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {summary.completedLessons} / {summary.totalLessons} レッスン完了
          </div>
        </div>

        {/* 学習時間 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            {formatLearningTime(summary.totalLearningTime)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            総学習時間
          </div>
        </div>

        {/* 達成項目 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {summary.completedLessons}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            完了レッスン数
          </div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>全体の進捗</span>
          <span>{summary.progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${summary.progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
