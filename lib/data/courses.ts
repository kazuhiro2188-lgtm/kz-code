import type { Course, Section, Lesson } from "@/lib/services/content";

/**
 * 静的コースデータ
 * 
 * コース、セクション、レッスンのメタデータを定義します。
 * データベースに依存せず、コードベースに含まれます。
 */

// コース1: AI駆動開発の基礎
const course1Id = "course-ai-driven-development-basics";
const section1Id = "section-prompt-engineering";
const section2Id = "section-ai-tools-integration";

export const staticCourses: Course[] = [
  {
    id: course1Id,
    title: "AI駆動開発の基礎",
    description: "AIと協働する開発手法の基本を学ぶコースです。プロンプトエンジニアリングからAIツールの統合まで、実践的なスキルを習得できます。",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "course-advanced-ai-techniques",
    title: "高度なAI活用テクニック",
    description: "より高度なAI活用方法を学ぶコースです。AIアーキテクチャ設計から、実践的なワークフロー構築までをカバーします。",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
];

export const staticSections: Section[] = [
  // コース1のセクション
  {
    id: section1Id,
    courseId: course1Id,
    title: "プロンプトエンジニアリング入門",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: section2Id,
    courseId: course1Id,
    title: "AIツールの統合",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  // コース2のセクション
  {
    id: "section-ai-architecture",
    courseId: "course-advanced-ai-techniques",
    title: "AIアーキテクチャ設計",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
];

export const staticLessons: Lesson[] = [
  // コース1、セクション1のレッスン
  {
    id: "lesson-prompt-basics",
    sectionId: section1Id,
    courseId: course1Id,
    title: "プロンプトの基本",
    contentPath: "course1/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-effective-prompt-design",
    sectionId: section1Id,
    courseId: course1Id,
    title: "効果的なプロンプト設計",
    contentPath: "course1/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  // コース1、セクション2のレッスン
  {
    id: "lesson-ai-tools-selection",
    sectionId: section2Id,
    courseId: course1Id,
    title: "AIツールの選び方",
    contentPath: "course1/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  // コース2、セクション1のレッスン
  {
    id: "lesson-ai-system-design-principles",
    sectionId: "section-ai-architecture",
    courseId: "course-advanced-ai-techniques",
    title: "AIシステムの設計原則",
    contentPath: "course2/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
];

/**
 * コースIDからコースを取得
 */
export function getCourseById(courseId: string): Course | null {
  return staticCourses.find((c) => c.id === courseId) || null;
}

/**
 * コースIDからセクション一覧を取得
 */
export function getSectionsByCourseId(courseId: string): Section[] {
  return staticSections
    .filter((s) => s.courseId === courseId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * セクションIDからレッスン一覧を取得
 */
export function getLessonsBySectionId(sectionId: string): Lesson[] {
  return staticLessons
    .filter((l) => l.sectionId === sectionId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * レッスンIDからレッスンを取得
 */
export function getLessonById(lessonId: string): Lesson | null {
  return staticLessons.find((l) => l.id === lessonId) || null;
}

/**
 * コースID、セクションID、レッスンIDからレッスンを取得
 */
export function getLesson(
  courseId: string,
  sectionId: string,
  lessonId: string
): Lesson | null {
  const lesson = staticLessons.find(
    (l) => l.id === lessonId && l.sectionId === sectionId && l.courseId === courseId
  );
  return lesson || null;
}
