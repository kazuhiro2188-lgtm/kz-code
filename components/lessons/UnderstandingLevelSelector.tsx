"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UnderstandingLevel } from "@/lib/data/understanding-levels";
import { understandingLevels } from "@/lib/data/understanding-levels";

type UnderstandingLevelSelectorProps = {
  /**
   * 理解度選択時のコールバック
   */
  onSelect: (level: UnderstandingLevel) => void;
  /**
   * 閉じるボタンがクリックされた時のコールバック
   */
  onClose?: () => void;
};

/**
 * UnderstandingLevelSelector コンポーネント
 * 
 * レッスン完了時に理解度を選択するモーダル
 */
export default function UnderstandingLevelSelector({
  onSelect,
  onClose,
}: UnderstandingLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<UnderstandingLevel | null>(null);

  const handleSelect = (level: UnderstandingLevel) => {
    setSelectedLevel(level);
    // 少し遅延してからコールバックを呼び出す（アニメーションのため）
    setTimeout(() => {
      onSelect(level);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-2xl w-full my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              理解度を選択してください
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="閉じる"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            このレッスンの理解度を選択してください。理解度に応じて復習を推奨します。
          </p>
        </div>

        {/* 理解度選択肢 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {understandingLevels.map((level) => {
            const isSelected = selectedLevel === level.id;

            return (
              <motion.button
                key={level.id}
                onClick={() => handleSelect(level.id)}
                disabled={!!selectedLevel}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                } ${selectedLevel && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                whileHover={selectedLevel ? {} : { scale: 1.02 }}
                whileTap={selectedLevel ? {} : { scale: 0.98 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl flex-shrink-0">{level.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                      {level.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* 復習推奨メッセージ */}
        <AnimatePresence>
          {selectedLevel && understandingLevels.find((l) => l.id === selectedLevel)?.recommendReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    復習を推奨します
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    理解度が低いため、このレッスンの復習をおすすめします。復習することで、より深い理解が得られます。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
