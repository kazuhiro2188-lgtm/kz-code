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
  const circumference = 2 * Math.PI * 45; // 半径45の円周
  const progressOffset = circumference - (summary.progressPercentage / 100) * circumference;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            学習進捗
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* 完了率 - 円形プログレス */}
          <div className="relative" role="region" aria-label="完了率">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full min-h-[200px] sm:min-h-[240px] flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:outline-none" tabIndex={0}>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 sm:mb-4" aria-hidden="true">
                  <svg className="transform -rotate-90 w-24 h-24 sm:w-28 sm:h-28" aria-hidden="true">
                    <circle
                      cx="48"
                      cy="48"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-blue-100 dark:text-blue-900/50"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 - (summary.progressPercentage / 100) * 2 * Math.PI * 34}
                      strokeLinecap="round"
                      className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400" aria-live="polite">
                        {summary.progressPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    完了率
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {summary.completedLessons} / {summary.totalLessons} レッスン
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 学習時間 */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 rounded-2xl p-4 sm:p-6 border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full min-h-[200px] sm:min-h-[240px] flex flex-col">
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatLearningTime(summary.totalLearningTime)}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    総学習時間
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 達成項目 */}
          <div className="relative sm:col-span-2 md:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/20 rounded-2xl p-4 sm:p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full min-h-[200px] sm:min-h-[240px] flex flex-col">
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {summary.completedLessons}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    完了レッスン数
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="relative">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              全体の進捗
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.progressPercentage}%</span>
          </div>
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${summary.progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
