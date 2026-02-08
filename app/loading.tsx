export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative inline-block">
          {/* メインスピナー */}
          <div className="inline-block h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-solid border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400"></div>
          {/* 内側のスピナー */}
          <div className="absolute inset-0 inline-block h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-solid border-transparent border-r-blue-400 dark:border-r-blue-500" style={{ animationDirection: "reverse", animationDuration: "0.8s" }}></div>
        </div>
        <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
          読み込み中...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          しばらくお待ちください
        </p>
      </div>
    </div>
  );
}
