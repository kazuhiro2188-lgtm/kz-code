import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude エラーの型定義
 */
export type ClaudeError = {
  message: string;
  code?: string;
};

/**
 * Result 型（成功または失敗を表現）
 */
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * チャットメッセージの型定義
 */
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * ストリームチャンクの型定義
 */
export type StreamChunk = {
  type: "text" | "done" | "error";
  content?: string;
  error?: string;
};

/**
 * ClaudeService インターフェース
 * 
 * Anthropic Claude API との統合とストリーミング応答処理を抽象化します。
 */
export interface ClaudeService {
  /**
   * ストリーミング応答を生成します
   * 
   * @param messages - チャットメッセージ履歴
   * @param context - レッスンコンテキスト（オプション）
   * @returns ReadableStream（成功時）またはエラー
   */
  streamResponse(
    messages: ChatMessage[],
    context?: string
  ): Promise<Result<ReadableStream<StreamChunk>, ClaudeError>>;
}

/**
 * ClaudeService の実装
 */
class ClaudeServiceImpl implements ClaudeService {
  private anthropic: Anthropic | null = null;

  /**
   * Anthropic クライアントを初期化します
   */
  private getClient(): Anthropic {
    if (!this.anthropic) {
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY 環境変数が設定されていません");
      }

      this.anthropic = new Anthropic({
        apiKey,
      });
    }

    return this.anthropic;
  }

  async streamResponse(
    messages: ChatMessage[],
    context?: string
  ): Promise<Result<ReadableStream<StreamChunk>, ClaudeError>> {
    try {
      // API キーの確認
      if (!process.env.ANTHROPIC_API_KEY) {
        return {
          success: false,
          error: {
            message: "Claude API キーが設定されていません",
            code: "API_KEY_NOT_SET",
          },
        };
      }

      // メッセージの検証
      if (!messages || messages.length === 0) {
        return {
          success: false,
          error: {
            message: "メッセージが空です",
            code: "VALIDATION_ERROR",
          },
        };
      }

      const client = this.getClient();

      // システムプロンプトを構築（コンテキストがある場合）
      const systemPrompt = context
        ? `あなたは AI駆動開発の学習をサポートするアシスタントです。以下のレッスンコンテキストを参考に、学習者の質問に答えてください。

レッスンコンテキスト:
${context}

回答は日本語で、分かりやすく、学習者の理解を深めるように説明してください。`
        : `あなたは AI駆動開発の学習をサポートするアシスタントです。学習者の質問に日本語で分かりやすく答えてください。`;

      // Anthropic API のメッセージ形式に変換
      const anthropicMessages: Anthropic.MessageParam[] = messages.map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        })
      );

      // ストリーミングを開始
      const stream = await client.messages.stream({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      // ReadableStream を作成
      const readableStream = new ReadableStream<StreamChunk>({
        async start(controller) {
          try {
            // ストリームイベントを処理
            for await (const event of stream) {
              if (event.type === "content_block_delta") {
                // テキストチャンクを送信
                if (event.delta.type === "text_delta") {
                  controller.enqueue({
                    type: "text",
                    content: event.delta.text,
                  });
                }
              } else if (event.type === "message_stop") {
                // ストリーム完了
                controller.enqueue({
                  type: "done",
                });
                controller.close();
                break;
              }
            }
          } catch (error) {
            controller.enqueue({
              type: "error",
              error:
                error instanceof Error
                  ? error.message
                  : "ストリーミング中に予期しないエラーが発生しました",
            });
            controller.close();
          }
        },
        cancel() {
          // ストリームがキャンセルされた場合のクリーンアップ
          stream.abort();
        },
      });

      return {
        success: true,
        data: readableStream,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Claude API の呼び出し中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }
}

/**
 * ClaudeService のシングルトンインスタンス
 */
export const claudeService: ClaudeService = new ClaudeServiceImpl();
