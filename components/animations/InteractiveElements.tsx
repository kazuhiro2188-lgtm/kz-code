"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * AnimatedCard コンポーネント
 * 
 * ホバー時にアニメーションするカードです。
 */
export function AnimatedCard({
  children,
  className = "",
  hoverScale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * BounceOnHover コンポーネント
 * 
 * ホバー時にバウンスするアニメーションです。
 */
export function BounceOnHover({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: [0, -8, 0],
        transition: {
          duration: 0.4,
          ease: "easeOut",
        },
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ShakeOnHover コンポーネント
 * 
 * ホバー時にシェイクするアニメーションです。
 */
export function ShakeOnHover({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        x: [0, -4, 4, -4, 4, 0],
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RippleButton コンポーネント
 * 
 * クリック時にリップルエフェクトが発生するボタンです。
 */
export function RippleButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.button>
  );
}

/**
 * MagneticButton コンポーネント
 * 
 * マウスに反応して動くボタンです。
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover="hover"
      initial="initial"
      variants={{
        initial: { x: 0, y: 0 },
        hover: {
          x: 0,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
          },
        },
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowOnHover コンポーネント
 * 
 * ホバー時にグローエフェクトが発生します。
 */
export function GlowOnHover({
  children,
  className = "",
  glowColor = "rgba(59, 130, 246, 0.5)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        boxShadow: `0 0 20px ${glowColor}`,
        transition: { duration: 0.3 },
      }}
      style={{ willChange: "box-shadow" }}
    >
      {children}
    </motion.div>
  );
}
