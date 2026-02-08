"use client";

import { FadeIn, SlideUp } from "@/components/animations/PageTransition";
import type { ReactNode } from "react";

/**
 * フェードインラッパー
 * 
 * Server ComponentからClient Componentのアニメーションを使用するためのラッパー
 */
export function FadeInWrapper({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <FadeIn delay={delay}>{children}</FadeIn>;
}

/**
 * スライドアップラッパー
 * 
 * Server ComponentからClient Componentのアニメーションを使用するためのラッパー
 */
export function SlideUpWrapper({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <SlideUp delay={delay}>{children}</SlideUp>;
}
