"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeLessonAction } from "./actions";
import { AnimatedButton } from "@/components/animations/InteractiveElements";

/**
 * CompleteLessonButton コンポーネントの Props
 */
type CompleteLessonButtonProps = {
  lessonId: string;
  isCompleted: boolean;
};

/**
 * レッスン完了ボタンコンポーネント
 * 
 * Client Component として実装され、レッスン完了の処理を担当します。
 */
export default function CompleteLessonButton({
  lessonId,
  isCompleted,
}: CompleteLessonButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    setError(null);

    startTransition(async () => {
      const result = await completeLessonAction(lessonId);
      if (result.error) {
        setError(result.error);
      } else {
        // ページをリロードして完了状態を反映
        router.refresh();
      }
    });
  };

  if (isCompleted) {
    return (
      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">このレッスンは完了しています</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatedButton
        onClick={handleComplete}
        disabled={isPending}
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
            完了処理中...
          </span>
        ) : (
          "レッスンを完了する"
        )}
      </AnimatedButton>
    </div>
  );
}
