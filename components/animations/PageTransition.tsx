"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * PageTransition コンポーネント
 * 
 * ページ遷移時のアニメーションを提供します。
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn コンポーネント
 * 
 * フェードインアニメーションを提供します。
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideUp コンポーネント
 * 
 * 下から上にスライドするアニメーションを提供します。
 */
export function SlideUp({
  children,
  delay = 0,
  duration = 0.4,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer コンポーネント
 * 
 * 子要素に順番にアニメーションを適用します。
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem コンポーネント
 * 
 * StaggerContainer 内で使用するアニメーションアイテムです。
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
