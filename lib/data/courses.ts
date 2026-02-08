import type { Course, Section, Lesson } from "@/lib/services/content";

/**
 * 静的コースデータ
 * 
 * カリキュラム全面刷新計画に基づく8コース、17セクション、約45レッスンのメタデータ定義
 * データベースに依存せず、コードベースに含まれます。
 * 
 * コンセプト: プログラミングコードを覚えさせるアプリではなく、
 * AIでコード生成は任せるも前提知識・人間が判断するに必要な知識を取り入れる基礎理論・原理を教える
 */

// ============================================================================
// コース1: 前提知識 - インフラの基礎
// ============================================================================
const course1Id = "course-infrastructure-basics";
const course1Section1Id = "section-infrastructure-fundamentals";

// ============================================================================
// コース2: ソフトウェアアーキテクチャ基礎
// ============================================================================
const course2Id = "course-software-architecture-basics";
const course2Section1Id = "section-clean-architecture";
const course2Section2Id = "section-hexagonal-architecture";
const course2Section3Id = "section-ddd";

// ============================================================================
// コース3: インフラ設計の基礎
// ============================================================================
const course3Id = "course-infrastructure-design-basics";
const course3Section1Id = "section-infrastructure-design-principles";

// ============================================================================
// コース4: データモデリング
// ============================================================================
const course4Id = "course-data-modeling";
const course4Section1Id = "section-rdbms-design";
const course4Section2Id = "section-nosql-vector-db";
const course4Section3Id = "section-data-flow";

// ============================================================================
// コース5: クラウドアーキテクチャ
// ============================================================================
const course5Id = "course-cloud-architecture";
const course5Section1Id = "section-scalability-design";
const course5Section2Id = "section-cost-optimization";
const course5Section3Id = "section-availability-redundancy";
const course5Section4Id = "section-infrastructure-as-code";

// ============================================================================
// コース6: 要件定義・問題分解能力
// ============================================================================
const course6Id = "course-requirements-analysis";
const course6Section1Id = "section-requirements-definition";
const course6Section2Id = "section-problem-decomposition";

// ============================================================================
// コース7: AI活用設計
// ============================================================================
const course7Id = "course-ai-design";
const course7Section1Id = "section-pre-prompt-design";
const course7Section2Id = "section-role-separation";
const course7Section3Id = "section-workflow-design";

// ============================================================================
// コース8: 非機能要件
// ============================================================================
const course8Id = "course-non-functional-requirements";
const course8Section1Id = "section-performance";
const course8Section2Id = "section-security";
const course8Section3Id = "section-maintainability";
const course8Section4Id = "section-logging-design";

// ============================================================================
// コース定義
// ============================================================================
export const staticCourses: Course[] = [
  {
    id: course1Id,
    title: "前提知識 - インフラの基礎",
    description: "AIが安全にコードを書けるように促すためのインフラ基礎知識を学びます。サーバー、ネットワーク、OS、コンテナなどの基本概念を理解し、AI開発におけるインフラの重要性を把握します。",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course2Id,
    title: "ソフトウェアアーキテクチャ基礎",
    description: "クリーンアーキテクチャ、ヘキサゴナルアーキテクチャ、DDDなどの設計手法を学びます。AI開発においても重要な設計原則を理解し、保守性の高いシステムを構築するための基礎を身につけます。",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course3Id,
    title: "インフラ設計の基礎",
    description: "AIが安全にコードを書けるように促すためのインフラ設計の基礎を学びます。インフラ設計の原則、パターン、ベストプラクティスを理解し、AI開発におけるインフラ設計の重要性を把握します。",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: course4Id,
    title: "データモデリング",
    description: "RDBMS設計、NoSQL、ベクトルDB、データフロー全体を学びます。AI開発において重要なデータ設計の基礎を理解し、適切なデータモデルを選択・設計できるようになります。",
    orderIndex: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: course5Id,
    title: "クラウドアーキテクチャ",
    description: "スケーラビリティ設計、コスト最適化、可用性・冗長化、Infrastructure as Codeを学びます。クラウド環境でのAIシステム構築に必要な知識を習得します。",
    orderIndex: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: course6Id,
    title: "要件定義・問題分解能力",
    description: "要件定義と問題分解の手法を学びます。AI開発においても重要な、複雑な問題を適切に分解し、明確な要件を定義する能力を身につけます。",
    orderIndex: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: course7Id,
    title: "AI活用設計",
    description: "プロンプト以前の設計力、役割分担の切り分け、ワークフロー設計を学びます。AIを効果的に活用するための設計手法を理解し、AIと人間の役割を適切に分担できるようになります。",
    orderIndex: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: course8Id,
    title: "非機能要件",
    description: "パフォーマンス、セキュリティ、可用性・保守性、ログの設計を学びます。AIシステムにおいても重要な非機能要件を理解し、品質の高いシステムを構築するための知識を習得します。",
    orderIndex: 8,
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// セクション定義
// ============================================================================
export const staticSections: Section[] = [
  // コース1: 前提知識 - インフラの基礎
  {
    id: course1Section1Id,
    courseId: course1Id,
    title: "インフラの基礎知識",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },

  // コース2: ソフトウェアアーキテクチャ基礎
  {
    id: course2Section1Id,
    courseId: course2Id,
    title: "クリーンアーキテクチャ",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course2Section2Id,
    courseId: course2Id,
    title: "ヘキサゴナルアーキテクチャ",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course2Section3Id,
    courseId: course2Id,
    title: "ドメイン駆動設計（DDD）",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // コース3: インフラ設計の基礎
  {
    id: course3Section1Id,
    courseId: course3Id,
    title: "インフラ設計の原則とパターン",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },

  // コース4: データモデリング
  {
    id: course4Section1Id,
    courseId: course4Id,
    title: "RDBMS設計",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course4Section2Id,
    courseId: course4Id,
    title: "NoSQL・ベクトルDB",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course4Section3Id,
    courseId: course4Id,
    title: "データフロー全体",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // コース5: クラウドアーキテクチャ
  {
    id: course5Section1Id,
    courseId: course5Id,
    title: "スケーラビリティ設計",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course5Section2Id,
    courseId: course5Id,
    title: "コスト最適化",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course5Section3Id,
    courseId: course5Id,
    title: "可用性・冗長化",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: course5Section4Id,
    courseId: course5Id,
    title: "Infrastructure as Code",
    orderIndex: 4,
    createdAt: new Date().toISOString(),
  },

  // コース6: 要件定義・問題分解能力
  {
    id: course6Section1Id,
    courseId: course6Id,
    title: "要件定義",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course6Section2Id,
    courseId: course6Id,
    title: "問題分解",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },

  // コース7: AI活用設計
  {
    id: course7Section1Id,
    courseId: course7Id,
    title: "プロンプト以前の設計力",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course7Section2Id,
    courseId: course7Id,
    title: "役割分担の切り分け",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course7Section3Id,
    courseId: course7Id,
    title: "ワークフロー設計",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // コース8: 非機能要件
  {
    id: course8Section1Id,
    courseId: course8Id,
    title: "パフォーマンス",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: course8Section2Id,
    courseId: course8Id,
    title: "セキュリティ",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: course8Section3Id,
    courseId: course8Id,
    title: "可用性・保守性",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: course8Section4Id,
    courseId: course8Id,
    title: "ログの設計",
    orderIndex: 4,
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// レッスン定義（約45レッスン）
// ============================================================================
export const staticLessons: Lesson[] = [
  // ============================================================================
  // コース1: 前提知識 - インフラの基礎
  // ============================================================================
  // セクション1: インフラの基礎知識
  {
    id: "lesson-infrastructure-overview",
    sectionId: course1Section1Id,
    courseId: course1Id,
    title: "インフラとは何か",
    contentPath: "course1/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-server-basics",
    sectionId: course1Section1Id,
    courseId: course1Id,
    title: "サーバーの基礎",
    contentPath: "course1/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-network-basics",
    sectionId: course1Section1Id,
    courseId: course1Id,
    title: "ネットワークの基礎",
    contentPath: "course1/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-container-basics",
    sectionId: course1Section1Id,
    courseId: course1Id,
    title: "コンテナの基礎",
    contentPath: "course1/section1/lesson4.mdx",
    orderIndex: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-infrastructure-ai-development",
    sectionId: course1Section1Id,
    courseId: course1Id,
    title: "AI開発におけるインフラの重要性",
    contentPath: "course1/section1/lesson5.mdx",
    orderIndex: 5,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース2: ソフトウェアアーキテクチャ基礎
  // ============================================================================
  // セクション1: クリーンアーキテクチャ
  {
    id: "lesson-clean-architecture-principles",
    sectionId: course2Section1Id,
    courseId: course2Id,
    title: "クリーンアーキテクチャの原則",
    contentPath: "course2/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-clean-architecture-layers",
    sectionId: course2Section1Id,
    courseId: course2Id,
    title: "レイヤー構造と依存関係",
    contentPath: "course2/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-clean-architecture-ai",
    sectionId: course2Section1Id,
    courseId: course2Id,
    title: "AI開発におけるクリーンアーキテクチャの適用",
    contentPath: "course2/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: ヘキサゴナルアーキテクチャ
  {
    id: "lesson-hexagonal-architecture-concepts",
    sectionId: course2Section2Id,
    courseId: course2Id,
    title: "ヘキサゴナルアーキテクチャの概念",
    contentPath: "course2/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-hexagonal-ports-adapters",
    sectionId: course2Section2Id,
    courseId: course2Id,
    title: "ポートとアダプター",
    contentPath: "course2/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-hexagonal-ai-integration",
    sectionId: course2Section2Id,
    courseId: course2Id,
    title: "AI統合におけるヘキサゴナルアーキテクチャ",
    contentPath: "course2/section2/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション3: ドメイン駆動設計（DDD）
  {
    id: "lesson-ddd-fundamentals",
    sectionId: course2Section3Id,
    courseId: course2Id,
    title: "DDDの基礎概念",
    contentPath: "course2/section3/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ddd-bounded-contexts",
    sectionId: course2Section3Id,
    courseId: course2Id,
    title: "境界づけられたコンテキスト",
    contentPath: "course2/section3/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ddd-entities-value-objects",
    sectionId: course2Section3Id,
    courseId: course2Id,
    title: "エンティティと値オブジェクト",
    contentPath: "course2/section3/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース3: インフラ設計の基礎
  // ============================================================================
  // セクション1: インフラ設計の原則とパターン
  {
    id: "lesson-infrastructure-design-principles",
    sectionId: course3Section1Id,
    courseId: course3Id,
    title: "インフラ設計の原則",
    contentPath: "course3/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-infrastructure-patterns",
    sectionId: course3Section1Id,
    courseId: course3Id,
    title: "インフラ設計パターン",
    contentPath: "course3/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-infrastructure-ai-safety",
    sectionId: course3Section1Id,
    courseId: course3Id,
    title: "AI開発における安全なインフラ設計",
    contentPath: "course3/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース4: データモデリング
  // ============================================================================
  // セクション1: RDBMS設計
  {
    id: "lesson-rdbms-fundamentals",
    sectionId: course4Section1Id,
    courseId: course4Id,
    title: "RDBMSの基礎",
    contentPath: "course4/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-normalization",
    sectionId: course4Section1Id,
    courseId: course4Id,
    title: "正規化と非正規化",
    contentPath: "course4/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-index-design",
    sectionId: course4Section1Id,
    courseId: course4Id,
    title: "インデックス設計",
    contentPath: "course4/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: NoSQL・ベクトルDB
  {
    id: "lesson-nosql-overview",
    sectionId: course4Section2Id,
    courseId: course4Id,
    title: "NoSQLデータベースの概要",
    contentPath: "course4/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-vector-db-basics",
    sectionId: course4Section2Id,
    courseId: course4Id,
    title: "ベクトルDBの基礎",
    contentPath: "course4/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-vector-db-ai-applications",
    sectionId: course4Section2Id,
    courseId: course4Id,
    title: "AIアプリケーションにおけるベクトルDB",
    contentPath: "course4/section2/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション3: データフロー全体
  {
    id: "lesson-data-flow-overview",
    sectionId: course4Section3Id,
    courseId: course4Id,
    title: "データフローの全体像",
    contentPath: "course4/section3/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-etl-pipelines",
    sectionId: course4Section3Id,
    courseId: course4Id,
    title: "ETLパイプライン",
    contentPath: "course4/section3/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-data-flow-ai",
    sectionId: course4Section3Id,
    courseId: course4Id,
    title: "AIシステムにおけるデータフロー設計",
    contentPath: "course4/section3/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース5: クラウドアーキテクチャ
  // ============================================================================
  // セクション1: スケーラビリティ設計
  {
    id: "lesson-scalability-concepts",
    sectionId: course5Section1Id,
    courseId: course5Id,
    title: "スケーラビリティの概念",
    contentPath: "course5/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-horizontal-vertical-scaling",
    sectionId: course5Section1Id,
    courseId: course5Id,
    title: "水平スケーリングと垂直スケーリング",
    contentPath: "course5/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-auto-scaling",
    sectionId: course5Section1Id,
    courseId: course5Id,
    title: "オートスケーリング",
    contentPath: "course5/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: コスト最適化
  {
    id: "lesson-cost-optimization-strategies",
    sectionId: course5Section2Id,
    courseId: course5Id,
    title: "コスト最適化の戦略",
    contentPath: "course5/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-resource-right-sizing",
    sectionId: course5Section2Id,
    courseId: course5Id,
    title: "リソースの適正サイジング",
    contentPath: "course5/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },

  // セクション3: 可用性・冗長化
  {
    id: "lesson-availability-concepts",
    sectionId: course5Section3Id,
    courseId: course5Id,
    title: "可用性の概念とSLA",
    contentPath: "course5/section3/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-redundancy-patterns",
    sectionId: course5Section3Id,
    courseId: course5Id,
    title: "冗長化パターン",
    contentPath: "course5/section3/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-disaster-recovery",
    sectionId: course5Section3Id,
    courseId: course5Id,
    title: "災害復旧計画",
    contentPath: "course5/section3/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション4: Infrastructure as Code
  {
    id: "lesson-iac-concepts",
    sectionId: course5Section4Id,
    courseId: course5Id,
    title: "Infrastructure as Codeの概念",
    contentPath: "course5/section4/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-terraform-basics",
    sectionId: course5Section4Id,
    courseId: course5Id,
    title: "Terraformの基礎",
    contentPath: "course5/section4/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース6: 要件定義・問題分解能力
  // ============================================================================
  // セクション1: 要件定義
  {
    id: "lesson-requirements-gathering",
    sectionId: course6Section1Id,
    courseId: course6Id,
    title: "要件収集の手法",
    contentPath: "course6/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-requirements-analysis",
    sectionId: course6Section1Id,
    courseId: course6Id,
    title: "要件分析と整理",
    contentPath: "course6/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-requirements-documentation",
    sectionId: course6Section1Id,
    courseId: course6Id,
    title: "要件の文書化",
    contentPath: "course6/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: 問題分解
  {
    id: "lesson-problem-decomposition-principles",
    sectionId: course6Section2Id,
    courseId: course6Id,
    title: "問題分解の原則",
    contentPath: "course6/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-decomposition-techniques",
    sectionId: course6Section2Id,
    courseId: course6Id,
    title: "問題分解のテクニック",
    contentPath: "course6/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-decomposition-ai-projects",
    sectionId: course6Section2Id,
    courseId: course6Id,
    title: "AIプロジェクトにおける問題分解",
    contentPath: "course6/section2/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース7: AI活用設計
  // ============================================================================
  // セクション1: プロンプト以前の設計力
  {
    id: "lesson-pre-prompt-design-thinking",
    sectionId: course7Section1Id,
    courseId: course7Id,
    title: "プロンプト以前の設計思考",
    contentPath: "course7/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-system-design-before-prompting",
    sectionId: course7Section1Id,
    courseId: course7Id,
    title: "プロンプト前のシステム設計",
    contentPath: "course7/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-architecture-for-ai",
    sectionId: course7Section1Id,
    courseId: course7Id,
    title: "AIのためのアーキテクチャ設計",
    contentPath: "course7/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: 役割分担の切り分け
  {
    id: "lesson-human-ai-roles",
    sectionId: course7Section2Id,
    courseId: course7Id,
    title: "人間とAIの役割分担",
    contentPath: "course7/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-responsibility-separation",
    sectionId: course7Section2Id,
    courseId: course7Id,
    title: "責任の分離原則",
    contentPath: "course7/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ai-human-collaboration",
    sectionId: course7Section2Id,
    courseId: course7Id,
    title: "AIと人間の協働設計",
    contentPath: "course7/section2/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション3: ワークフロー設計
  {
    id: "lesson-workflow-design-principles",
    sectionId: course7Section3Id,
    courseId: course7Id,
    title: "ワークフロー設計の原則",
    contentPath: "course7/section3/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ai-workflow-patterns",
    sectionId: course7Section3Id,
    courseId: course7Id,
    title: "AIワークフローパターン",
    contentPath: "course7/section3/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-workflow-optimization",
    sectionId: course7Section3Id,
    courseId: course7Id,
    title: "ワークフローの最適化",
    contentPath: "course7/section3/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // ============================================================================
  // コース8: 非機能要件
  // ============================================================================
  // セクション1: パフォーマンス
  {
    id: "lesson-performance-requirements",
    sectionId: course8Section1Id,
    courseId: course8Id,
    title: "パフォーマンス要件の定義",
    contentPath: "course8/section1/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-performance-optimization",
    sectionId: course8Section1Id,
    courseId: course8Id,
    title: "パフォーマンス最適化手法",
    contentPath: "course8/section1/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ai-performance",
    sectionId: course8Section1Id,
    courseId: course8Id,
    title: "AIシステムのパフォーマンス",
    contentPath: "course8/section1/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション2: セキュリティ
  {
    id: "lesson-security-fundamentals",
    sectionId: course8Section2Id,
    courseId: course8Id,
    title: "セキュリティの基礎",
    contentPath: "course8/section2/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-security-threats",
    sectionId: course8Section2Id,
    courseId: course8Id,
    title: "セキュリティ脅威と対策",
    contentPath: "course8/section2/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-ai-security",
    sectionId: course8Section2Id,
    courseId: course8Id,
    title: "AIシステムのセキュリティ",
    contentPath: "course8/section2/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション3: 可用性・保守性
  {
    id: "lesson-maintainability-principles",
    sectionId: course8Section3Id,
    courseId: course8Id,
    title: "保守性の原則",
    contentPath: "course8/section3/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-code-quality",
    sectionId: course8Section3Id,
    courseId: course8Id,
    title: "コード品質と保守性",
    contentPath: "course8/section3/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-testing-strategies",
    sectionId: course8Section3Id,
    courseId: course8Id,
    title: "テスト戦略",
    contentPath: "course8/section3/lesson3.mdx",
    orderIndex: 3,
    createdAt: new Date().toISOString(),
  },

  // セクション4: ログの設計
  {
    id: "lesson-logging-fundamentals",
    sectionId: course8Section4Id,
    courseId: course8Id,
    title: "ログ設計の基礎",
    contentPath: "course8/section4/lesson1.mdx",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-log-levels-structure",
    sectionId: course8Section4Id,
    courseId: course8Id,
    title: "ログレベルと構造",
    contentPath: "course8/section4/lesson2.mdx",
    orderIndex: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-logging-ai-systems",
    sectionId: course8Section4Id,
    courseId: course8Id,
    title: "AIシステムにおけるログ設計",
    contentPath: "course8/section4/lesson3.mdx",
    orderIndex: 3,
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
