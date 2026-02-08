#!/usr/bin/env tsx
/**
 * カリキュラム構造の動作確認スクリプト
 * 
 * 実行方法: npx tsx scripts/test-curriculum.ts
 */

import {
  staticCourses,
  staticSections,
  staticLessons,
  getCourseById,
  getSectionsByCourseId,
  getLessonsBySectionId,
  getLessonById,
  getLesson,
} from "../lib/data/courses";

console.log("=".repeat(60));
console.log("カリキュラム構造の動作確認");
console.log("=".repeat(60));
console.log();

// 1. コース数の確認
console.log("📚 コース数:", staticCourses.length);
console.log("  期待値: 8");
console.log(`  ${staticCourses.length === 8 ? "✅" : "❌"} ${staticCourses.length === 8 ? "OK" : "NG"}`);
console.log();

// 2. セクション数の確認
console.log("📖 セクション数:", staticSections.length);
console.log("  期待値: 17");
console.log(`  ${staticSections.length === 17 ? "✅" : "❌"} ${staticSections.length === 17 ? "OK" : "NG"}`);
console.log();

// 3. レッスン数の確認
console.log("📝 レッスン数:", staticLessons.length);
console.log("  期待値: 45");
console.log(`  ${staticLessons.length === 45 ? "✅" : "❌"} ${staticLessons.length === 45 ? "OK" : "NG"}`);
console.log();

// 4. 各コースの構造確認
console.log("=".repeat(60));
console.log("各コースの構造確認");
console.log("=".repeat(60));
console.log();

let totalLessonsCount = 0;
for (const course of staticCourses) {
  const sections = getSectionsByCourseId(course.id);
  let courseLessonCount = 0;
  
  for (const section of sections) {
    const lessons = getLessonsBySectionId(section.id);
    courseLessonCount += lessons.length;
  }
  
  totalLessonsCount += courseLessonCount;
  
  console.log(`📚 ${course.title}`);
  console.log(`   セクション数: ${sections.length}`);
  console.log(`   レッスン数: ${courseLessonCount}`);
  console.log();
}

console.log(`合計レッスン数: ${totalLessonsCount}`);
console.log(`  ${totalLessonsCount === 45 ? "✅" : "❌"} ${totalLessonsCount === 45 ? "OK" : "NG"}`);
console.log();

// 5. 関数の動作確認
console.log("=".repeat(60));
console.log("関数の動作確認");
console.log("=".repeat(60));
console.log();

// 5-1. getCourseById
const firstCourse = staticCourses[0];
const foundCourse = getCourseById(firstCourse.id);
console.log(`getCourseById("${firstCourse.id}")`);
console.log(`  ${foundCourse?.id === firstCourse.id ? "✅" : "❌"} ${foundCourse ? "OK" : "NG"}`);
console.log();

// 5-2. getSectionsByCourseId
const sections = getSectionsByCourseId(firstCourse.id);
console.log(`getSectionsByCourseId("${firstCourse.id}")`);
console.log(`  セクション数: ${sections.length}`);
console.log(`  ${sections.length > 0 ? "✅" : "❌"} ${sections.length > 0 ? "OK" : "NG"}`);
console.log();

// 5-3. getLessonsBySectionId
if (sections.length > 0) {
  const firstSection = sections[0];
  const lessons = getLessonsBySectionId(firstSection.id);
  console.log(`getLessonsBySectionId("${firstSection.id}")`);
  console.log(`  レッスン数: ${lessons.length}`);
  console.log(`  ${lessons.length > 0 ? "✅" : "❌"} ${lessons.length > 0 ? "OK" : "NG"}`);
  console.log();

  // 5-4. getLesson
  if (lessons.length > 0) {
    const firstLesson = lessons[0];
    const foundLesson = getLesson(
      firstCourse.id,
      firstSection.id,
      firstLesson.id
    );
    console.log(`getLesson("${firstCourse.id}", "${firstSection.id}", "${firstLesson.id}")`);
    console.log(`  ${foundLesson?.id === firstLesson.id ? "✅" : "❌"} ${foundLesson ? "OK" : "NG"}`);
    console.log();

    // 5-5. getLessonById
    const foundLessonById = getLessonById(firstLesson.id);
    console.log(`getLessonById("${firstLesson.id}")`);
    console.log(`  ${foundLessonById?.id === firstLesson.id ? "✅" : "❌"} ${foundLessonById ? "OK" : "NG"}`);
    console.log();
  }
}

// 6. contentPathの確認
console.log("=".repeat(60));
console.log("contentPathの確認");
console.log("=".repeat(60));
console.log();

const invalidPaths: string[] = [];
for (const lesson of staticLessons) {
  if (!lesson.contentPath || lesson.contentPath.trim() === "") {
    invalidPaths.push(lesson.id);
  }
}

if (invalidPaths.length === 0) {
  console.log("✅ すべてのレッスンにcontentPathが設定されています");
} else {
  console.log(`❌ contentPathが設定されていないレッスン: ${invalidPaths.length}件`);
  invalidPaths.forEach((id) => console.log(`  - ${id}`));
}
console.log();

// 7. 重複IDの確認
console.log("=".repeat(60));
console.log("重複IDの確認");
console.log("=".repeat(60));
console.log();

const courseIds = staticCourses.map((c) => c.id);
const sectionIds = staticSections.map((s) => s.id);
const lessonIds = staticLessons.map((l) => l.id);

const duplicateCourseIds = courseIds.filter((id, index) => courseIds.indexOf(id) !== index);
const duplicateSectionIds = sectionIds.filter((id, index) => sectionIds.indexOf(id) !== index);
const duplicateLessonIds = lessonIds.filter((id, index) => lessonIds.indexOf(id) !== index);

if (duplicateCourseIds.length === 0 && duplicateSectionIds.length === 0 && duplicateLessonIds.length === 0) {
  console.log("✅ 重複IDはありません");
} else {
  if (duplicateCourseIds.length > 0) {
    console.log(`❌ 重複するコースID: ${duplicateCourseIds.join(", ")}`);
  }
  if (duplicateSectionIds.length > 0) {
    console.log(`❌ 重複するセクションID: ${duplicateSectionIds.join(", ")}`);
  }
  if (duplicateLessonIds.length > 0) {
    console.log(`❌ 重複するレッスンID: ${duplicateLessonIds.join(", ")}`);
  }
}
console.log();

// 8. セクションとコースの関連性確認
console.log("=".repeat(60));
console.log("セクションとコースの関連性確認");
console.log("=".repeat(60));
console.log();

const orphanSections: string[] = [];
for (const section of staticSections) {
  const course = getCourseById(section.courseId);
  if (!course) {
    orphanSections.push(section.id);
  }
}

if (orphanSections.length === 0) {
  console.log("✅ すべてのセクションが有効なコースに関連付けられています");
} else {
  console.log(`❌ 無効なコースに関連付けられたセクション: ${orphanSections.length}件`);
  orphanSections.forEach((id) => console.log(`  - ${id}`));
}
console.log();

// 9. レッスンとセクションの関連性確認
console.log("=".repeat(60));
console.log("レッスンとセクションの関連性確認");
console.log("=".repeat(60));
console.log();

const orphanLessons: string[] = [];
for (const lesson of staticLessons) {
  const section = staticSections.find((s) => s.id === lesson.sectionId);
  if (!section) {
    orphanLessons.push(lesson.id);
  } else {
    // セクションのコースIDとレッスンのコースIDが一致するか確認
    if (section.courseId !== lesson.courseId) {
      orphanLessons.push(lesson.id);
    }
  }
}

if (orphanLessons.length === 0) {
  console.log("✅ すべてのレッスンが有効なセクションに関連付けられています");
} else {
  console.log(`❌ 無効なセクションに関連付けられたレッスン: ${orphanLessons.length}件`);
  orphanLessons.forEach((id) => console.log(`  - ${id}`));
}
console.log();

console.log("=".repeat(60));
console.log("動作確認完了");
console.log("=".repeat(60));
