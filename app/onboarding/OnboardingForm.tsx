"use client";

import { useState, useTransition } from "react";
import { completeOnboardingAction } from "./actions";
import ErrorMessage from "@/components/ui/ErrorMessage";

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
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
      {/* 学習目標選択 */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <label className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
            学習目標を選択してください
          </label>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {LEARNING_GOALS.map((goal, index) => (
            <label
              key={goal.value}
              className={`group relative flex items-start p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:outline-none ${
                learningGoal === goal.value
                  ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-2 border-blue-400 dark:border-blue-500 shadow-lg scale-[1.02]"
                  : "bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-[1.01] hover:-translate-y-0.5"
              }`}
              role="radio"
              aria-checked={learningGoal === goal.value}
              aria-labelledby={`goal-label-${goal.value}`}
              aria-describedby={`goal-description-${goal.value}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLearningGoal(goal.value);
                }
              }}
            >
              {/* ホバー時のシャインエフェクト */}
              {learningGoal !== goal.value && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent dark:via-blue-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </div>
              )}
              
              <input
                type="radio"
                name="learningGoal"
                value={goal.value}
                checked={learningGoal === goal.value}
                onChange={(e) => setLearningGoal(e.target.value)}
                disabled={isPending}
                className="sr-only"
                aria-labelledby={`goal-label-${goal.value}`}
                aria-describedby={`goal-description-${goal.value}`}
              />
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 sm:mr-4 transition-all duration-300 ${
                learningGoal === goal.value
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg scale-110"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-purple-900/50 group-hover:scale-110 group-hover:rotate-3"
              }`}>
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  learningGoal === goal.value
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div 
                  id={`goal-label-${goal.value}`}
                  className={`font-semibold text-base sm:text-lg mb-1 transition-all duration-300 ${
                    learningGoal === goal.value
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1"
                  }`}
                >
                  {goal.label}
                </div>
                <div 
                  id={`goal-description-${goal.value}`}
                  className={`text-xs sm:text-sm leading-relaxed transition-all duration-300 ${
                    learningGoal === goal.value
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                >
                  {goal.description}
                </div>
              </div>
              {learningGoal === goal.value && (
                <div className="ml-2 sm:ml-3 flex-shrink-0 animate-in fade-in zoom-in duration-300">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* 経験レベル選択 */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <label className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-700 dark:from-white dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
            経験レベルを選択してください
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {EXPERIENCE_LEVELS.map((level, index) => {
            const levelIcons = [
              <svg key="beginner" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>,
              <svg key="intermediate" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>,
              <svg key="advanced" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            ];
            
            return (
              <label
                key={level.value}
                className={`group relative flex flex-col items-center p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:outline-none ${
                  experienceLevel === level.value
                    ? "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-2 border-purple-400 dark:border-purple-500 shadow-xl scale-105"
                    : "bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 hover:-translate-y-1"
                }`}
                role="radio"
                aria-checked={experienceLevel === level.value}
                aria-labelledby={`level-label-${level.value}`}
                aria-describedby={`level-description-${level.value}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExperienceLevel(level.value);
                  }
                }}
              >
                {/* ホバー時のシャインエフェクト */}
                {experienceLevel !== level.value && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent dark:via-purple-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </div>
                )}
                
                {/* ホバー時のパルスエフェクト */}
                {experienceLevel !== level.value && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                    <div className="absolute inset-0 border-2 border-purple-300 dark:border-purple-600 rounded-xl animate-pulse" />
                  </div>
                )}
                
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={experienceLevel === level.value}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  disabled={isPending}
                  className="sr-only"
                  aria-labelledby={`level-label-${level.value}`}
                  aria-describedby={`level-description-${level.value}`}
                />
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 relative z-10 ${
                  experienceLevel === level.value
                    ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl scale-110"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:from-purple-900/50 dark:group-hover:to-pink-900/50 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg"
                }`}>
                  <div className={`transition-all duration-300 ${
                    experienceLevel === level.value
                      ? "text-white"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110"
                  }`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8">
                      {levelIcons[index]}
                    </div>
                  </div>
                </div>
                <div className="text-center relative z-10">
                  <div 
                    id={`level-label-${level.value}`}
                    className={`font-bold text-base sm:text-lg mb-1.5 sm:mb-2 transition-all duration-300 ${
                      experienceLevel === level.value
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-105"
                    }`}
                  >
                    {level.label}
                  </div>
                  <div 
                    id={`level-description-${level.value}`}
                    className={`text-xs sm:text-sm leading-relaxed transition-all duration-300 ${
                      experienceLevel === level.value
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {level.description}
                  </div>
                </div>
                {experienceLevel === level.value && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      )}

      {/* 送信ボタン */}
      <div className="pt-2 sm:pt-4">
        <button
          type="submit"
          disabled={isPending || !learningGoal || !experienceLevel}
          className="group relative w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-base sm:text-lg rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          {/* グラデーションアニメーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* ホバー時のシャインエフェクト */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
          
          {/* パルスエフェクト */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl animate-pulse" />
          </div>
          
          {/* ボタンテキスト */}
          <span className="relative flex items-center justify-center gap-3 z-10">
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-6 w-6"
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
              </>
            ) : (
              <>
                <span className="group-hover:scale-105 transition-transform duration-300">学習を開始する</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
