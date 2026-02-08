"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
          style={{ willChange: "opacity, transform" }}
        >
          {/* メインスピナー */}
          <motion.div
            className="inline-block h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-solid border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ willChange: "transform" }}
          />
          {/* 内側のスピナー */}
          <motion.div
            className="absolute inset-0 inline-block h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-solid border-transparent border-r-blue-400 dark:border-r-blue-500"
            animate={{ rotate: -360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ willChange: "transform" }}
          />
          {/* 中央のグラデーション */}
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
            読み込み中...
          </p>
          <motion.p
            className="mt-2 text-sm text-gray-500 dark:text-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            しばらくお待ちください
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
