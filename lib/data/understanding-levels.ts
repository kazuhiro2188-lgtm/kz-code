/**
 * 理解度レベル定義
 * 
 * レッスン完了時の理解度を選択し、復習推奨に使用します。
 */

export type UnderstandingLevel = "excellent" | "good" | "fair" | "poor";

export type UnderstandingLevelData = {
  /**
   * 理解度レベルID
   */
  id: UnderstandingLevel;
  /**
   * 表示名
   */
  label: string;
  /**
   * 説明
   */
  description: string;
  /**
   * 復習推奨のしきい値（このレベル以下は復習推奨）
   */
  recommendReview: boolean;
  /**
   * アイコン（絵文字）
   */
  icon: string;
};

/**
 * 理解度レベルの定義
 */
export const understandingLevels: UnderstandingLevelData[] = [
  {
    id: "excellent",
    label: "よく理解できた",
    description: "内容を完全に理解し、自信を持って説明できます",
    recommendReview: false,
    icon: "🌟",
  },
  {
    id: "good",
    label: "まあまあ理解できた",
    description: "おおむね理解できましたが、一部不明な点があります",
    recommendReview: false,
    icon: "✅",
  },
  {
    id: "fair",
    label: "あまり理解できなかった",
    description: "基本的な内容は理解できましたが、詳細が不明確です",
    recommendReview: true,
    icon: "🤔",
  },
  {
    id: "poor",
    label: "ほとんど理解できなかった",
    description: "内容が難しく、もう一度学習する必要があります",
    recommendReview: true,
    icon: "📚",
  },
];

/**
 * 理解度レベルIDからデータを取得
 */
export function getUnderstandingLevelById(
  levelId: UnderstandingLevel
): UnderstandingLevelData | null {
  return understandingLevels.find((level) => level.id === levelId) || null;
}

/**
 * 理解度レベルに基づいて復習を推奨するかどうかを判定
 */
export function shouldRecommendReview(level: UnderstandingLevel): boolean {
  const levelData = getUnderstandingLevelById(level);
  return levelData?.recommendReview || false;
}
