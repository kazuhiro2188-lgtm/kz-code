/**
 * 用語解説データ
 * 
 * IT・業界専門用語の定義と解説を提供します。
 * MDXコンテンツ内で用語にアンダーラインを表示し、クリック/タップでポップアップを表示します。
 */

export type GlossaryTerm = {
  /**
   * 用語ID（一意の識別子）
   */
  id: string;
  /**
   * 用語名（表示名）
   */
  term: string;
  /**
   * 用語の読み方（カタカナ表記など）
   */
  reading?: string;
  /**
   * 用語の説明・解説
   */
  description: string;
  /**
   * 用語のカテゴリ
   */
  category: GlossaryCategory;
  /**
   * 関連用語のIDリスト
   */
  relatedTerms?: string[];
  /**
   * 用語の別名・エイリアス（検索用）
   */
  aliases?: string[];
};

export type GlossaryCategory =
  | "infrastructure" // インフラ
  | "architecture" // アーキテクチャ
  | "database" // データベース
  | "cloud" // クラウド
  | "security" // セキュリティ
  | "ai" // AI・機械学習
  | "development" // 開発
  | "general"; // 一般

/**
 * 用語辞書
 */
export const glossaryTerms: GlossaryTerm[] = [
  // ============================================================================
  // インフラ関連
  // ============================================================================
  {
    id: "infrastructure",
    term: "インフラストラクチャ",
    reading: "インフラストラクチャ",
    description: "システムやサービスを動作させるための基盤となる技術要素の総称。サーバー、ネットワーク、ストレージ、OS、ミドルウェアなどが含まれます。",
    category: "infrastructure",
    aliases: ["インフラ", "Infrastructure"],
  },
  {
    id: "server",
    term: "サーバー",
    reading: "サーバー",
    description: "ネットワークを通じて他のコンピュータ（クライアント）にサービスを提供するコンピュータまたはソフトウェア。Webサーバー、データベースサーバー、アプリケーションサーバーなどがあります。",
    category: "infrastructure",
    aliases: ["Server"],
  },
  {
    id: "container",
    term: "コンテナ",
    reading: "コンテナ",
    description: "アプリケーションとその実行環境をパッケージ化する技術。DockerやKubernetesなどで使用され、軽量で移植性が高い仮想化技術です。",
    category: "infrastructure",
    aliases: ["Container", "Docker", "コンテナ技術"],
  },
  {
    id: "kubernetes",
    term: "Kubernetes",
    reading: "クーバネティス",
    description: "コンテナオーケストレーションプラットフォーム。複数のコンテナを管理し、スケーリング、ロードバランシング、自己修復などの機能を提供します。",
    category: "infrastructure",
    aliases: ["K8s", "k8s"],
  },

  // ============================================================================
  // アーキテクチャ関連
  // ============================================================================
  {
    id: "clean-architecture",
    term: "クリーンアーキテクチャ",
    reading: "クリーンアーキテクチャ",
    description: "Robert C. Martinが提唱したアーキテクチャパターン。依存関係の方向を制御し、ビジネスロジックを中心に配置することで、テスト容易性と保守性を向上させます。",
    category: "architecture",
    aliases: ["Clean Architecture", "クリーンアーキテクチャパターン"],
  },
  {
    id: "hexagonal-architecture",
    term: "ヘキサゴナルアーキテクチャ",
    reading: "ヘキサゴナルアーキテクチャ",
    description: "Alistair Cockburnが提唱したアーキテクチャパターン。ポートとアダプターを使用して、アプリケーションのコアロジックを外部の技術的詳細から分離します。",
    category: "architecture",
    aliases: ["Hexagonal Architecture", "ポート・アダプターパターン"],
  },
  {
    id: "ddd",
    term: "ドメイン駆動設計",
    reading: "ドメインくどうせっけい",
    description: "Eric Evansが提唱した設計手法。ビジネスドメインの概念を中心にソフトウェアを設計し、ドメインモデルをコードに反映させます。",
    category: "architecture",
    aliases: ["DDD", "Domain-Driven Design", "ドメイン駆動"],
  },
  {
    id: "bounded-context",
    term: "境界づけられたコンテキスト",
    reading: "きょうかいくられたコンテキスト",
    description: "DDDにおける重要な概念。ドメインモデルが有効な明確な境界を定義し、その境界内で一貫した用語とルールを適用します。",
    category: "architecture",
    aliases: ["Bounded Context", "境界コンテキスト"],
  },

  // ============================================================================
  // データベース関連
  // ============================================================================
  {
    id: "rdbms",
    term: "RDBMS",
    reading: "アールディービーエムエス",
    description: "リレーショナルデータベース管理システム。表形式のデータを管理し、SQLを使用してデータを操作します。MySQL、PostgreSQL、Oracleなどがあります。",
    category: "database",
    aliases: ["リレーショナルデータベース", "Relational Database"],
  },
  {
    id: "normalization",
    term: "正規化",
    reading: "せいきか",
    description: "データベース設計において、データの冗長性を排除し、整合性を保つための手法。第1正規形から第5正規形まであります。",
    category: "database",
    aliases: ["Normalization", "正規化プロセス"],
  },
  {
    id: "nosql",
    term: "NoSQL",
    reading: "ノーエスキューエル",
    description: "リレーショナルデータベース以外のデータベースの総称。キーバリュー型、ドキュメント型、カラム型、グラフ型などがあります。",
    category: "database",
    aliases: ["NoSQLデータベース", "非リレーショナルデータベース"],
  },
  {
    id: "vector-db",
    term: "ベクトルDB",
    reading: "ベクトルデータベース",
    description: "ベクトル（数値の配列）を効率的に保存・検索するためのデータベース。AI・機械学習における埋め込みベクトルの類似度検索に使用されます。",
    category: "database",
    aliases: ["Vector Database", "ベクトルデータベース", "埋め込みベクトル"],
  },

  // ============================================================================
  // クラウド関連
  // ============================================================================
  {
    id: "scalability",
    term: "スケーラビリティ",
    reading: "スケーラビリティ",
    description: "システムが負荷の増加に対応できる能力。水平スケーリング（サーバー数を増やす）と垂直スケーリング（サーバーの性能を上げる）があります。",
    category: "cloud",
    aliases: ["スケーリング", "Scalability", "拡張性"],
  },
  {
    id: "auto-scaling",
    term: "オートスケーリング",
    reading: "オートスケーリング",
    description: "負荷に応じて自動的にリソースを増減させる機能。クラウド環境で一般的に提供されており、コスト最適化とパフォーマンス向上を両立します。",
    category: "cloud",
    aliases: ["自動スケーリング", "Auto Scaling"],
  },
  {
    id: "iac",
    term: "Infrastructure as Code",
    reading: "インフラストラクチャ・アズ・コード",
    description: "インフラの設定をコードとして管理する手法。Terraform、CloudFormation、Ansibleなどのツールを使用し、バージョン管理と再現性を実現します。",
    category: "cloud",
    aliases: ["IaC", "インフラコード化", "Infrastructure as Code"],
  },
  {
    id: "sla",
    term: "SLA",
    reading: "エスエルエー",
    description: "サービスレベル合意。サービス提供者が顧客に提供するサービス品質の基準を定めた合意。可用性、パフォーマンス、サポート時間などが含まれます。",
    category: "cloud",
    aliases: ["Service Level Agreement", "サービスレベル合意"],
  },

  // ============================================================================
  // セキュリティ関連
  // ============================================================================
  {
    id: "rls",
    term: "Row Level Security",
    reading: "ローレベルセキュリティ",
    description: "データベースの行レベルでアクセス制御を行う機能。ユーザーやロールに応じて、特定の行のみにアクセスを許可します。",
    category: "security",
    aliases: ["RLS", "行レベルセキュリティ"],
  },
  {
    id: "authentication",
    term: "認証",
    reading: "にんしょう",
    description: "ユーザーが本人であることを確認するプロセス。IDとパスワード、多要素認証、OAuthなどがあります。",
    category: "security",
    aliases: ["Authentication", "本人確認"],
  },
  {
    id: "authorization",
    term: "認可",
    reading: "にんか",
    description: "認証されたユーザーが特定のリソースにアクセスする権限があるかを確認するプロセス。",
    category: "security",
    aliases: ["Authorization", "アクセス制御"],
  },

  // ============================================================================
  // AI・機械学習関連
  // ============================================================================
  {
    id: "prompt",
    term: "プロンプト",
    reading: "プロンプト",
    description: "AIモデルに入力するテキスト指示。効果的なプロンプト設計により、AIの出力品質を向上させることができます。",
    category: "ai",
    aliases: ["Prompt", "プロンプトエンジニアリング"],
  },
  {
    id: "embedding",
    term: "埋め込み",
    reading: "うめこみ",
    description: "テキストや画像などのデータを数値ベクトルに変換する技術。AIモデルが理解できる形式に変換し、類似度検索などに使用されます。",
    category: "ai",
    aliases: ["Embedding", "ベクトル化"],
  },
  {
    id: "llm",
    term: "大規模言語モデル",
    reading: "だいきぼげんごモデル",
    description: "大量のテキストデータで学習したAIモデル。自然言語の理解と生成が可能で、ChatGPT、GPT-4などが代表例です。",
    category: "ai",
    aliases: ["LLM", "Large Language Model", "言語モデル"],
  },

  // ============================================================================
  // 開発関連
  // ============================================================================
  {
    id: "api",
    term: "API",
    reading: "エーピーアイ",
    description: "アプリケーションプログラミングインターフェース。ソフトウェア間でデータや機能を共有するための仕様。REST API、GraphQLなどがあります。",
    category: "development",
    aliases: ["Application Programming Interface", "アプリケーションインターフェース"],
  },
  {
    id: "rest",
    term: "REST",
    reading: "レスト",
    description: "Representational State Transferの略。Webサービスの設計原則で、HTTPメソッド（GET、POST、PUT、DELETE）を使用してリソースを操作します。",
    category: "development",
    aliases: ["REST API", "RESTful"],
  },
  {
    id: "etl",
    term: "ETL",
    reading: "イーティーエル",
    description: "Extract（抽出）、Transform（変換）、Load（読み込み）の略。データを抽出し、変換して、別のシステムに読み込むプロセス。",
    category: "development",
    aliases: ["ETLパイプライン", "データパイプライン"],
  },
];

/**
 * 用語IDから用語を取得
 */
export function getGlossaryTermById(termId: string): GlossaryTerm | null {
  return glossaryTerms.find((term) => term.id === termId) || null;
}

/**
 * 用語名またはエイリアスから用語を検索
 */
export function findGlossaryTerm(searchText: string): GlossaryTerm | null {
  const normalizedSearch = searchText.toLowerCase().trim();
  
  return (
    glossaryTerms.find(
      (term) =>
        term.term.toLowerCase() === normalizedSearch ||
        term.term.toLowerCase().includes(normalizedSearch) ||
        term.aliases?.some((alias) => alias.toLowerCase() === normalizedSearch)
    ) || null
  );
}

/**
 * カテゴリから用語一覧を取得
 */
export function getGlossaryTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return glossaryTerms.filter((term) => term.category === category);
}

/**
 * テキスト内の用語を検出
 * 
 * @param text - 検索対象のテキスト
 * @returns 検出された用語の配列（用語ID、開始位置、終了位置）
 */
export function detectGlossaryTermsInText(text: string): Array<{
  termId: string;
  term: GlossaryTerm;
  startIndex: number;
  endIndex: number;
  matchedText: string;
}> {
  const results: Array<{
    termId: string;
    term: GlossaryTerm;
    startIndex: number;
    endIndex: number;
    matchedText: string;
  }> = [];

  // 各用語について、テキスト内での出現を検索
  for (const glossaryTerm of glossaryTerms) {
    // 用語名で検索
    const termPattern = new RegExp(
      `(${escapeRegex(glossaryTerm.term)})`,
      "gi"
    );
    let match;
    while ((match = termPattern.exec(text)) !== null) {
      results.push({
        termId: glossaryTerm.id,
        term: glossaryTerm,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchedText: match[0],
      });
    }

    // エイリアスで検索
    if (glossaryTerm.aliases) {
      for (const alias of glossaryTerm.aliases) {
        const aliasPattern = new RegExp(`(${escapeRegex(alias)})`, "gi");
        let aliasMatch: RegExpExecArray | null;
        while ((aliasMatch = aliasPattern.exec(text)) !== null) {
          // 既に同じ位置で検出されている場合はスキップ
          const alreadyDetected = results.some(
            (r) =>
              r.startIndex === aliasMatch!.index &&
              r.endIndex === aliasMatch!.index + aliasMatch![0].length
          );
          if (!alreadyDetected) {
            results.push({
              termId: glossaryTerm.id,
              term: glossaryTerm,
              startIndex: aliasMatch.index,
              endIndex: aliasMatch.index + aliasMatch[0].length,
              matchedText: aliasMatch[0],
            });
          }
        }
      }
    }
  }

  // 重複を除去（同じ位置で複数の用語が検出された場合、最初のものを優先）
  const uniqueResults = results.filter((result, index, self) => {
    return (
      index ===
      self.findIndex(
        (r) =>
          r.startIndex === result.startIndex && r.endIndex === result.endIndex
      )
    );
  });

  // 位置順にソート
  return uniqueResults.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
