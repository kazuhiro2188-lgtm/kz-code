"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Section, Lesson } from "@/lib/services/content";
import type { LessonStatus } from "@/lib/services/progress";

type SectionLessonListWrapperProps = {
  courseId: string;
  sections: Array<Section & { lessons: Lesson[] }>;
  lessonStatusesArray: Array<[string, LessonStatus]>;
};

// SectionLessonListをssr: falseで動的インポート
const SectionLessonList = dynamic(() => import("@/components/courses/SectionLessonList"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">レッスン一覧を読み込み中...</div>
    </div>
  ),
});

/**
 * SectionLessonListのClient Componentラッパー
 * 
 * Server Componentからssr: falseを使った動的インポートを行うために必要です。
 * Mapを配列に変換して渡し、ここでMapに再構築します。
 */
export default function SectionLessonListWrapper({
  courseId,
  sections,
  lessonStatusesArray,
}: SectionLessonListWrapperProps) {
  // 配列をMapに変換
  const lessonStatuses = useMemo(() => {
    return new Map<string, LessonStatus>(lessonStatusesArray);
  }, [lessonStatusesArray]);

  return (
    <SectionLessonList
      courseId={courseId}
      sections={sections}
      lessonStatuses={lessonStatuses}
    />
  );
}
