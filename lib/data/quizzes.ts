/**
 * 章末課題データ
 * 
 * カテゴリ・章毎に課題を定義し、答え合わせ・解説機能を提供します。
 * 実践型の学習を促進するための課題を用意します。
 */

export type QuizQuestionType = "single-choice" | "multiple-choice" | "text" | "code";

export type QuizQuestion = {
  /**
   * 問題ID（一意の識別子）
   */
  id: string;
  /**
   * 問題文
   */
  question: string;
  /**
   * 問題タイプ
   */
  type: QuizQuestionType;
  /**
   * 選択肢（single-choice, multiple-choiceの場合）
   */
  options?: Array<{
    id: string;
    text: string;
  }>;
  /**
   * 正解（選択肢のIDの配列、またはテキスト）
   */
  correctAnswer: string | string[];
  /**
   * 解説
   */
  explanation: string;
  /**
   * ヒント（オプション）
   */
  hint?: string;
};

export type Quiz = {
  /**
   * 課題ID（一意の識別子）
   */
  id: string;
  /**
   * セクションID（この課題が属するセクション）
   */
  sectionId: string;
  /**
   * コースID（この課題が属するコース）
   */
  courseId: string;
  /**
   * 課題タイトル
   */
  title: string;
  /**
   * 課題の説明
   */
  description: string;
  /**
   * 問題一覧
   */
  questions: QuizQuestion[];
  /**
   * 順序インデックス
   */
  orderIndex: number;
};

/**
 * 課題データ
 */
export const quizzes: Quiz[] = [
  // ============================================================================
  // コース1: 前提知識 - インフラの基礎
  // ============================================================================
  {
    id: "quiz-infrastructure-fundamentals",
    sectionId: "section-infrastructure-fundamentals",
    courseId: "course-infrastructure-basics",
    title: "インフラの基礎知識 - 章末課題",
    description: "この章で学んだインフラの基礎知識を確認しましょう。",
    orderIndex: 1,
    questions: [
      {
        id: "q1-infrastructure-basics",
        question: "インフラストラクチャとは何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "アプリケーションのコード" },
          { id: "b", text: "システムやサービスを動作させるための基盤となる技術要素の総称" },
          { id: "c", text: "データベースの設計" },
          { id: "d", text: "UIデザイン" },
        ],
        correctAnswer: "b",
        explanation: "インフラストラクチャは、システムやサービスを動作させるための基盤となる技術要素の総称です。サーバー、ネットワーク、ストレージ、OS、ミドルウェアなどが含まれます。",
      },
      {
        id: "q2-server-basics",
        question: "サーバーの役割として正しいものはどれですか？（複数選択可）",
        type: "multiple-choice",
        options: [
          { id: "a", text: "ネットワークを通じて他のコンピュータにサービスを提供する" },
          { id: "b", text: "Webページを表示する" },
          { id: "c", text: "データベースを管理する" },
          { id: "d", text: "アプリケーションを実行する" },
        ],
        correctAnswer: ["a", "c", "d"],
        explanation: "サーバーはネットワークを通じて他のコンピュータ（クライアント）にサービスを提供するコンピュータまたはソフトウェアです。Webサーバー、データベースサーバー、アプリケーションサーバーなどがあります。",
      },
      {
        id: "q3-container-basics",
        question: "コンテナ技術の特徴として正しいものはどれですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "仮想マシンより重い" },
          { id: "b", text: "軽量で移植性が高い" },
          { id: "c", text: "アプリケーション間で影響を与える" },
          { id: "d", text: "環境に依存する" },
        ],
        correctAnswer: "b",
        explanation: "コンテナは軽量で移植性が高く、どの環境でも同じように動作します。また、アプリケーション間で影響を与えない分離性も特徴です。",
      },
    ],
  },

  // ============================================================================
  // コース2: ソフトウェアアーキテクチャ基礎
  // ============================================================================
  {
    id: "quiz-clean-architecture",
    sectionId: "section-clean-architecture",
    courseId: "course-software-architecture-basics",
    title: "クリーンアーキテクチャ - 章末課題",
    description: "クリーンアーキテクチャの理解度を確認しましょう。",
    orderIndex: 1,
    questions: [
      {
        id: "q1-clean-architecture-principles",
        question: "クリーンアーキテクチャの主な目的は何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "コードを短くすること" },
          { id: "b", text: "依存関係の方向を制御し、ビジネスロジックを中心に配置することで、テスト容易性と保守性を向上させる" },
          { id: "c", text: "パフォーマンスを最適化すること" },
          { id: "d", text: "UIを美しくすること" },
        ],
        correctAnswer: "b",
        explanation: "クリーンアーキテクチャは、依存関係の方向を制御し、ビジネスロジックを中心に配置することで、テスト容易性と保守性を向上させることが主な目的です。",
      },
      {
        id: "q2-clean-architecture-layers",
        question: "クリーンアーキテクチャのレイヤー構造について、正しい依存関係の方向はどれですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "外側のレイヤーが内側のレイヤーに依存する" },
          { id: "b", text: "内側のレイヤーが外側のレイヤーに依存する" },
          { id: "c", text: "レイヤー間に依存関係はない" },
          { id: "d", text: "双方向に依存する" },
        ],
        correctAnswer: "a",
        explanation: "クリーンアーキテクチャでは、外側のレイヤー（UI、フレームワーク）が内側のレイヤー（ビジネスロジック）に依存します。これにより、ビジネスロジックが外部の技術的詳細から独立します。",
      },
    ],
  },

  {
    id: "quiz-hexagonal-architecture",
    sectionId: "section-hexagonal-architecture",
    courseId: "course-software-architecture-basics",
    title: "ヘキサゴナルアーキテクチャ - 章末課題",
    description: "ヘキサゴナルアーキテクチャの理解度を確認しましょう。",
    orderIndex: 2,
    questions: [
      {
        id: "q1-hexagonal-concepts",
        question: "ヘキサゴナルアーキテクチャの「ポート」とは何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "ネットワークポート番号" },
          { id: "b", text: "アプリケーションのコアロジックと外部の技術的詳細を分離するためのインターフェース" },
          { id: "c", text: "データベースの接続ポート" },
          { id: "d", text: "Webサーバーのポート" },
        ],
        correctAnswer: "b",
        explanation: "ポートは、アプリケーションのコアロジックと外部の技術的詳細を分離するためのインターフェースです。アダプターを通じて外部システムと接続します。",
      },
    ],
  },

  // ============================================================================
  // コース4: データモデリング
  // ============================================================================
  {
    id: "quiz-rdbms-design",
    sectionId: "section-rdbms-design",
    courseId: "course-data-modeling",
    title: "RDBMS設計 - 章末課題",
    description: "RDBMS設計の理解度を確認しましょう。",
    orderIndex: 1,
    questions: [
      {
        id: "q1-normalization",
        question: "正規化の目的は何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "データの冗長性を排除し、整合性を保つ" },
          { id: "b", text: "データを増やす" },
          { id: "c", text: "パフォーマンスを下げる" },
          { id: "d", text: "データを複雑にする" },
        ],
        correctAnswer: "a",
        explanation: "正規化は、データベース設計において、データの冗長性を排除し、整合性を保つための手法です。第1正規形から第5正規形まであります。",
      },
    ],
  },

  {
    id: "quiz-vector-db",
    sectionId: "section-nosql-vector-db",
    courseId: "course-data-modeling",
    title: "ベクトルDB - 章末課題",
    description: "ベクトルDBの理解度を確認しましょう。",
    orderIndex: 2,
    questions: [
      {
        id: "q1-vector-db-purpose",
        question: "ベクトルDBの主な用途は何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "通常のデータベースと同じ用途" },
          { id: "b", text: "ベクトル（数値の配列）を効率的に保存・検索し、AI・機械学習における埋め込みベクトルの類似度検索に使用" },
          { id: "c", text: "画像を保存する" },
          { id: "d", text: "テキストを保存する" },
        ],
        correctAnswer: "b",
        explanation: "ベクトルDBは、ベクトル（数値の配列）を効率的に保存・検索するためのデータベースです。AI・機械学習における埋め込みベクトルの類似度検索に使用されます。",
      },
    ],
  },

  // ============================================================================
  // コース7: AI活用設計
  // ============================================================================
  {
    id: "quiz-ai-design",
    sectionId: "section-pre-prompt-design",
    courseId: "course-ai-design",
    title: "AI活用設計 - 章末課題",
    description: "AI活用設計の理解度を確認しましょう。",
    orderIndex: 1,
    questions: [
      {
        id: "q1-pre-prompt-design",
        question: "プロンプト以前の設計力とは何ですか？",
        type: "single-choice",
        options: [
          { id: "a", text: "プロンプトを書く技術" },
          { id: "b", text: "プロンプトを書く前に、システムの設計やアーキテクチャを考える力" },
          { id: "c", text: "AIの使い方" },
          { id: "d", text: "コードを書く技術" },
        ],
        correctAnswer: "b",
        explanation: "プロンプト以前の設計力とは、プロンプトを書く前に、システムの設計やアーキテクチャを考える力です。AIを効果的に活用するためには、適切な設計が重要です。",
      },
      {
        id: "q2-role-separation",
        question: "AIと人間の役割分担において重要なことは何ですか？（複数選択可）",
        type: "multiple-choice",
        options: [
          { id: "a", text: "AIにすべてを任せる" },
          { id: "b", text: "責任の分離原則を適用する" },
          { id: "c", text: "AIと人間の協働設計を行う" },
          { id: "d", text: "人間がすべてを行う" },
        ],
        correctAnswer: ["b", "c"],
        explanation: "AIと人間の役割分担においては、責任の分離原則を適用し、AIと人間の協働設計を行うことが重要です。それぞれの強みを活かすことができます。",
      },
    ],
  },
];

/**
 * セクションIDから課題を取得
 */
export function getQuizBySectionId(sectionId: string): Quiz | null {
  return quizzes.find((quiz) => quiz.sectionId === sectionId) || null;
}

/**
 * コースIDから課題一覧を取得
 */
export function getQuizzesByCourseId(courseId: string): Quiz[] {
  return quizzes
    .filter((quiz) => quiz.courseId === courseId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * 課題IDから課題を取得
 */
export function getQuizById(quizId: string): Quiz | null {
  return quizzes.find((quiz) => quiz.id === quizId) || null;
}
