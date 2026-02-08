/**
 * 統合テスト: AI チャットフロー
 *
 * 質問送信 → ストリーミング応答 → 履歴保存 のフローをテストします。
 * Supabase と Claude API をモックして検証します。
 *
 * Requirements: 5.1, 5.2, 5.3
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock はホイストされるため、vi.hoisted() で変数を先に定義
const { mockSupabaseClient, setFromResults, resetFromCounts, mockAnthropicMessages, createMockStream } = vi.hoisted(() => {
  // ===== Supabase モック =====
  let fromResults: Record<string, Array<{ data: unknown; error: unknown }>> = {};
  let fromCallCounts: Record<string, number> = {};

  function createChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = [
      "select", "insert", "update", "delete",
      "eq", "neq", "in", "order", "limit",
    ];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain["single"] = vi.fn().mockResolvedValue(result);
    chain["maybeSingle"] = vi.fn().mockResolvedValue(result);
    (chain as unknown as { then: unknown }).then = (
      resolve: (v: unknown) => void
    ) => Promise.resolve(result).then(resolve);
    return chain;
  }

  const mockSupabaseClient = {
    auth: { getUser: vi.fn() },
    from: vi.fn((table: string) => {
      if (!fromCallCounts[table]) fromCallCounts[table] = 0;
      const results = fromResults[table] || [{ data: null, error: null }];
      const idx = Math.min(fromCallCounts[table], results.length - 1);
      fromCallCounts[table]++;
      return createChain(results[idx]);
    }),
  };

  // ===== Claude API モック =====
  function createMockStream() {
    return {
      async *[Symbol.asyncIterator]() {
        yield {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "こんにちは、" },
        };
        yield {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "AI駆動開発について" },
        };
        yield {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "説明します。" },
        };
        yield { type: "message_stop" };
      },
      abort: vi.fn(),
    };
  }

  const mockAnthropicMessages = {
    stream: vi.fn().mockImplementation(() => Promise.resolve(createMockStream())),
  };

  // Anthropic のモッククラス
  class MockAnthropic {
    messages = mockAnthropicMessages;
    constructor() {
      // コンストラクタは空でOK
    }
  }

  return {
    mockSupabaseClient,
    setFromResults: (r: Record<string, Array<{ data: unknown; error: unknown }>>) => {
      fromResults = r;
    },
    resetFromCounts: () => {
      fromCallCounts = {};
    },
    mockAnthropicMessages,
    MockAnthropic,
    createMockStream,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class {
      messages = mockAnthropicMessages;
    },
  };
});

// テスト対象
import { chatService } from "@/lib/services/chat";
import { claudeService } from "@/lib/services/claude";

describe("AI チャットフロー統合テスト", () => {
  const userId = "user-001";
  const lessonId = "lesson-001";
  const conversationId = "conv-001";

  beforeEach(() => {
    vi.clearAllMocks();
    setFromResults({});
    resetFromCounts();
    // Claude API に必要な環境変数
    process.env.ANTHROPIC_API_KEY = "test-api-key";
    // stream モックを再設定（clearAllMocks でクリアされるため）
    mockAnthropicMessages.stream.mockImplementation(() =>
      Promise.resolve(createMockStream())
    );
  });

  // =============================================
  // 会話の作成
  // =============================================
  describe("会話の作成 (saveConversation)", () => {
    it("レッスンに紐づく会話を作成できる", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        chat_conversations: [
          {
            data: {
              id: conversationId,
              user_id: userId,
              lesson_id: lessonId,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            error: null,
          },
        ],
      });

      const result = await chatService.saveConversation(userId, lessonId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(conversationId);
        expect(result.data.userId).toBe(userId);
        expect(result.data.lessonId).toBe(lessonId);
      }
    });

    it("レッスンなしの会話を作成できる", async () => {
      setFromResults({
        chat_conversations: [
          {
            data: {
              id: "conv-002",
              user_id: userId,
              lesson_id: null,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            error: null,
          },
        ],
      });

      const result = await chatService.saveConversation(userId, null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lessonId).toBeNull();
      }
    });

    it("存在しないレッスンIDの場合エラーを返す", async () => {
      setFromResults({
        lessons: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await chatService.saveConversation(userId, "nonexistent");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LESSON_NOT_FOUND");
      }
    });

    it("RLSポリシー違反時にエラーを返す", async () => {
      setFromResults({
        chat_conversations: [
          { data: null, error: { code: "42501", message: "permission denied" } },
        ],
      });

      const result = await chatService.saveConversation(userId, null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PERMISSION_DENIED");
      }
    });
  });

  // =============================================
  // メッセージの保存
  // =============================================
  describe("メッセージの保存 (saveMessage)", () => {
    it("ユーザーメッセージを保存できる", async () => {
      setFromResults({
        chat_conversations: [
          { data: { id: conversationId }, error: null },
          { data: null, error: null },
        ],
        chat_messages: [
          { data: [], error: null },
          {
            data: {
              id: "msg-001",
              conversation_id: conversationId,
              role: "user",
              content: "AI駆動開発とは何ですか？",
              created_at: "2025-01-01T00:00:00Z",
              order_index: 0,
            },
            error: null,
          },
        ],
      });

      const result = await chatService.saveMessage(
        conversationId,
        "user",
        "AI駆動開発とは何ですか？"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("user");
        expect(result.data.content).toBe("AI駆動開発とは何ですか？");
        expect(result.data.orderIndex).toBe(0);
      }
    });

    it("アシスタントメッセージを保存できる", async () => {
      setFromResults({
        chat_conversations: [
          { data: { id: conversationId }, error: null },
          { data: null, error: null },
        ],
        chat_messages: [
          { data: [{ order_index: 0 }], error: null },
          {
            data: {
              id: "msg-002",
              conversation_id: conversationId,
              role: "assistant",
              content: "AI駆動開発とは...",
              created_at: "2025-01-01T00:00:01Z",
              order_index: 1,
            },
            error: null,
          },
        ],
      });

      const result = await chatService.saveMessage(
        conversationId,
        "assistant",
        "AI駆動開発とは..."
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("assistant");
        expect(result.data.orderIndex).toBe(1);
      }
    });

    it("存在しない会話IDの場合エラーを返す", async () => {
      setFromResults({
        chat_conversations: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await chatService.saveMessage(
        "nonexistent",
        "user",
        "テスト"
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("CONVERSATION_NOT_FOUND");
      }
    });
  });

  // =============================================
  // 会話履歴の取得
  // =============================================
  describe("会話履歴の取得 (getConversationHistory)", () => {
    it("会話履歴を正常に取得できる", async () => {
      setFromResults({
        chat_conversations: [
          {
            data: {
              id: conversationId,
              user_id: userId,
              lesson_id: lessonId,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:01:00Z",
            },
            error: null,
          },
        ],
        chat_messages: [
          {
            data: [
              {
                id: "msg-001",
                conversation_id: conversationId,
                role: "user",
                content: "質問です",
                created_at: "2025-01-01T00:00:00Z",
                order_index: 0,
              },
              {
                id: "msg-002",
                conversation_id: conversationId,
                role: "assistant",
                content: "回答です",
                created_at: "2025-01-01T00:00:01Z",
                order_index: 1,
              },
            ],
            error: null,
          },
        ],
      });

      const result = await chatService.getConversationHistory(conversationId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.conversation.id).toBe(conversationId);
        expect(result.data.messages).toHaveLength(2);
        expect(result.data.messages[0].role).toBe("user");
        expect(result.data.messages[1].role).toBe("assistant");
      }
    });

    it("存在しない会話IDの場合、nullを返す", async () => {
      setFromResults({
        chat_conversations: [
          { data: null, error: { code: "PGRST116", message: "not found" } },
        ],
      });

      const result = await chatService.getConversationHistory("nonexistent");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  // =============================================
  // Claude API ストリーミング応答
  // =============================================
  describe("Claude API ストリーミング応答 (streamResponse)", () => {
    it("メッセージを送信してストリーミング応答を受信できる", async () => {
      const messages = [
        { role: "user" as const, content: "AI駆動開発とは何ですか？" },
      ];

      const result = await claudeService.streamResponse(messages);
      expect(result.success).toBe(true);

      if (result.success) {
        const reader = result.data.getReader();
        const chunks: Array<{ type: string; content?: string }> = [];

        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          chunks.push(value);
          if (value.type === "done") done = true;
        }

        const textChunks = chunks.filter((c) => c.type === "text");
        expect(textChunks.length).toBeGreaterThan(0);

        const fullText = textChunks.map((c) => c.content).join("");
        expect(fullText).toBe("こんにちは、AI駆動開発について説明します。");

        const doneChunks = chunks.filter((c) => c.type === "done");
        expect(doneChunks).toHaveLength(1);
      }
    });

    it("レッスンコンテキスト付きでストリーミング応答を受信できる", async () => {
      const messages = [
        { role: "user" as const, content: "このレッスンについて教えて" },
      ];
      const context = "# レッスン1: AI駆動開発入門\n\nAI駆動開発とは...";

      const result = await claudeService.streamResponse(messages, context);
      expect(result.success).toBe(true);

      expect(mockAnthropicMessages.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-3-5-sonnet-20241022",
          system: expect.stringContaining("レッスンコンテキスト"),
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "user", content: "このレッスンについて教えて" }),
          ]),
        })
      );
    });

    it("空のメッセージ配列でエラーを返す", async () => {
      const result = await claudeService.streamResponse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.message).toBe("メッセージが空です");
      }
    });

    it("API キーが未設定の場合エラーを返す", async () => {
      const originalKey = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const result = await claudeService.streamResponse([
        { role: "user", content: "テスト" },
      ]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("API_KEY_NOT_SET");
      }

      process.env.ANTHROPIC_API_KEY = originalKey;
    });
  });

  // =============================================
  // 質問送信 → ストリーミング応答 → 履歴保存 フローテスト
  // =============================================
  describe("質問送信 → ストリーミング応答 → 履歴保存 フロー", () => {
    it("完全なチャットフローを実行できる", async () => {
      setFromResults({
        lessons: [{ data: { id: lessonId }, error: null }],
        chat_conversations: [
          {
            data: {
              id: conversationId,
              user_id: userId,
              lesson_id: lessonId,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            error: null,
          },
          { data: { id: conversationId }, error: null },
          { data: null, error: null },
          { data: { id: conversationId }, error: null },
          { data: null, error: null },
        ],
        chat_messages: [
          { data: [], error: null },
          {
            data: {
              id: "msg-001",
              conversation_id: conversationId,
              role: "user",
              content: "AI駆動開発とは何ですか？",
              created_at: "2025-01-01T00:00:00Z",
              order_index: 0,
            },
            error: null,
          },
          { data: [{ order_index: 0 }], error: null },
          {
            data: {
              id: "msg-002",
              conversation_id: conversationId,
              role: "assistant",
              content: "こんにちは、AI駆動開発について説明します。",
              created_at: "2025-01-01T00:00:01Z",
              order_index: 1,
            },
            error: null,
          },
        ],
      });

      // Step 1: 会話を作成
      const convResult = await chatService.saveConversation(userId, lessonId);
      expect(convResult.success).toBe(true);

      // Step 2: ユーザーメッセージを保存
      const userMsgResult = await chatService.saveMessage(
        conversationId,
        "user",
        "AI駆動開発とは何ですか？"
      );
      expect(userMsgResult.success).toBe(true);

      // Step 3: Claude API でストリーミング応答を取得
      const streamResult = await claudeService.streamResponse([
        { role: "user", content: "AI駆動開発とは何ですか？" },
      ]);
      expect(streamResult.success).toBe(true);

      let fullResponse = "";
      if (streamResult.success) {
        const reader = streamResult.data.getReader();
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          if (value.type === "text" && value.content) {
            fullResponse += value.content;
          }
          if (value.type === "done") done = true;
        }
      }

      expect(fullResponse).toBe("こんにちは、AI駆動開発について説明します。");

      // Step 4: アシスタントメッセージを保存
      const assistantMsgResult = await chatService.saveMessage(
        conversationId,
        "assistant",
        fullResponse
      );
      expect(assistantMsgResult.success).toBe(true);
      if (assistantMsgResult.success) {
        expect(assistantMsgResult.data.role).toBe("assistant");
        expect(assistantMsgResult.data.orderIndex).toBe(1);
      }
    });
  });
});
