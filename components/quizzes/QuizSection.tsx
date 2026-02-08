"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quiz, QuizQuestion } from "@/lib/data/quizzes";

type QuizSectionProps = {
  quiz: Quiz;
};

/**
 * QuizSection コンポーネント
 * 
 * 章末課題を表示し、答え合わせ・解説機能を提供します。
 */
export default function QuizSection({ quiz }: QuizSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const toggleExplanation = (questionId: string) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const checkAnswer = (question: QuizQuestion): boolean => {
    const userAnswer = answers[question.id];
    if (!userAnswer) return false;

    if (question.type === "multiple-choice") {
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      
      return (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans))
      );
    }

    return userAnswer === question.correctAnswer;
  };

  const getScore = (): { correct: number; total: number } => {
    const correct = quiz.questions.filter((q) => checkAnswer(q)).length;
    return { correct, total: quiz.questions.length };
  };

  return (
    <div className="relative group mt-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-orange-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {quiz.title}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        </div>

        {/* 進捗バー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              問題 {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
            {showResults && (
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {getScore().correct} / {getScore().total} 問正解
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 問題表示 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuestion.question}
              </h3>

              {/* ヒント */}
              {currentQuestion.hint && !showResults && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">ヒント: </span>
                    {currentQuestion.hint}
                  </p>
                </div>
              )}

              {/* 選択肢 */}
              {currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      currentQuestion.type === "multiple-choice"
                        ? Array.isArray(answers[currentQuestion.id]) &&
                          answers[currentQuestion.id].includes(option.id)
                        : answers[currentQuestion.id] === option.id;

                    const isCorrect = showResults && option.id === currentQuestion.correctAnswer;
                    const isIncorrect =
                      showResults &&
                      isSelected &&
                      option.id !== currentQuestion.correctAnswer;

                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => {
                          if (showResults) return;
                          if (currentQuestion.type === "multiple-choice") {
                            const currentAnswers = Array.isArray(answers[currentQuestion.id])
                              ? answers[currentQuestion.id]
                              : [];
                            const newAnswers = isSelected
                              ? (currentAnswers as string[]).filter((id: string) => id !== option.id)
                              : [...(currentAnswers as string[]), option.id];
                            handleAnswerChange(currentQuestion.id, newAnswers);
                          } else {
                            handleAnswerChange(currentQuestion.id, option.id);
                          }
                        }}
                        disabled={showResults}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                        } ${
                          isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : ""
                        } ${
                          isIncorrect
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : ""
                        } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                        whileHover={showResults ? {} : { scale: 1.02 }}
                        whileTap={showResults ? {} : { scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-purple-500 bg-purple-500"
                                : "border-gray-300 dark:border-gray-600"
                            } ${
                              isCorrect
                                ? "border-green-500 bg-green-500"
                                : ""
                            } ${
                              isIncorrect
                                ? "border-red-500 bg-red-500"
                                : ""
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
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
                            )}
                          </div>
                          <span className="text-gray-900 dark:text-gray-100 flex-1">
                            {option.text}
                          </span>
                          {isCorrect && showResults && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              正解
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* 解説 */}
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {checkAnswer(currentQuestion) ? (
                        <span className="text-green-600 dark:text-green-400">✓ 正解です！</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">✗ 不正解です</span>
                      )}
                    </h4>
                    <button
                      onClick={() => toggleExplanation(currentQuestion.id)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      {showExplanation[currentQuestion.id] ? "解説を閉じる" : "解説を見る"}
                    </button>
                  </div>
                  {showExplanation[currentQuestion.id] && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isFirstQuestion
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            前の問題
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={showResults}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                showResults
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg"
              }`}
            >
              答え合わせ
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg transition-all"
            >
              次の問題
            </button>
          )}
        </div>

        {/* 結果サマリー */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              結果
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {getScore().correct} / {getScore().total} 問正解しました。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setShowResults(false);
                  setShowExplanation({});
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                もう一度解く
              </button>
              <button
                onClick={() => {
                  setShowExplanation((prev) => {
                    const newState: Record<string, boolean> = {};
                    quiz.questions.forEach((q) => {
                      newState[q.id] = true;
                    });
                    return newState;
                  });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                すべての解説を見る
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
