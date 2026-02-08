import type { Course } from "@/lib/services/content";

/**
 * CourseOverview コンポーネントの Props
 */
type CourseOverviewProps = {
  course: Course;
};

/**
 * コース概要表示コンポーネント
 */
export default function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {course.title}
      </h1>
      {course.description && (
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {course.description}
        </p>
      )}
    </div>
  );
}
