"use client";

import { useState, useTransition } from "react";
import { completeOnboardingAction } from "./actions";

/**
 * 学習目標の選択肢
 */
const LEARNING_GOALS = [
  {
    value: "ai-driven-development-basics",
    label: "AI駆動開発の基礎を学ぶ",
    description: "AIと協働する開発手法の基本を理解したい",
  },
  {
    value: "prompt-engineering",
    label: "プロンプトエンジニアリングを習得",
    description: "効果的なプロンプト設計スキルを身につけたい",
  },
  {
    value: "ai-architecture-design",
    label: "AIアーキテクチャ設計を学ぶ",
    description: "AIを活用したシステム設計の原理を理解したい",
  },
  {
    value: "ai-tool-integration",
    label: "AIツールの統合方法を学ぶ",
    description: "開発ワークフローにAIツールを組み込みたい",
  },
  {
    value: "advanced-ai-techniques",
    label: "高度なAI活用テクニックを習得",
    description: "より高度なAI活用方法を学びたい",
  },
] as const;

/**
 * 経験レベルの選択肢
 */
const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "初心者",
    description: "AI駆動開発は初めてです",
  },
  {
    value: "intermediate",
    label: "中級者",
    description: "基本的なAIツールの使用経験があります",
  },
  {
    value: "advanced",
    label: "上級者",
    description: "AIを活用した開発経験が豊富です",
  },
] as const;

/**
 * オンボーディングフォームコンポーネント
 * 
 * Client Component として実装され、フォーム状態管理と Server Action の呼び出しを担当します。
 */
export default function OnboardingForm() {
  const [learningGoal, setLearningGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!learningGoal || !experienceLevel) {
      setError("すべての項目を選択してください");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction(learningGoal, experienceLevel);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 学習目標選択 */}
      <div>
        <label className="block text-base font-semibold text-gray-900 dark:text-white mb-4">
          学習目標を選択してください
        </label>
        <div className="space-y-3">
          {LEARNING_GOALS.map((goal) => (
            <label
              key={goal.value}
              className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                learningGoal === goal.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="learningGoal"
                value={goal.value}
                checked={learningGoal === goal.value}
                onChange={(e) => setLearningGoal(e.target.value)}
                disabled={isPending}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {goal.label}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {goal.description}
                </div>
              </div>
              {learningGoal === goal.value && (
                <div className="ml-3 flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* 経験レベル選択 */}
      <div>
        <label className="block text-base font-semibold text-gray-900 dark:text-white mb-4">
          経験レベルを選択してください
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`relative flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                experienceLevel === level.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={experienceLevel === level.value}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={isPending}
                className="sr-only"
              />
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {level.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {level.description}
                </div>
              </div>
              {experienceLevel === level.value && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-start gap-2"
        >
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending || !learningGoal || !experienceLevel}
        className="w-full px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            保存中...
          </span>
        ) : (
          "学習を開始する"
        )}
      </button>
    </form>
  );
}
