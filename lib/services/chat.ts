import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * チャットエラーの型定義
 */
export type ChatError = {
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
 * 会話の型定義
 */
export type Conversation = {
  id: string;
  userId: string;
  lessonId: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * チャットメッセージの型定義
 */
export type Message = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  orderIndex: number;
};

/**
 * 会話履歴の型定義
 */
export type ConversationHistory = {
  conversation: Conversation;
  messages: Message[];
};

/**
 * ChatService インターフェース
 * 
 * AI チャット会話の保存と取得を抽象化します。
 */
export interface ChatService {
  /**
   * 会話を保存します
   * 
   * @param userId - ユーザーID
   * @param lessonId - レッスンID（オプション）
   * @returns 作成された会話（成功時）またはエラー
   */
  saveConversation(
    userId: string,
    lessonId?: string | null
  ): Promise<Result<Conversation, ChatError>>;

  /**
   * メッセージを保存します
   * 
   * @param conversationId - 会話ID
   * @param role - メッセージの役割（'user' または 'assistant'）
   * @param content - メッセージ内容
   * @returns 作成されたメッセージ（成功時）またはエラー
   */
  saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Result<Message, ChatError>>;

  /**
   * 会話履歴を取得します
   * 
   * @param conversationId - 会話ID
   * @returns 会話履歴（成功時）またはエラー
   */
  getConversationHistory(
    conversationId: string
  ): Promise<Result<ConversationHistory | null, ChatError>>;
}

/**
 * ChatService の実装
 */
class ChatServiceImpl implements ChatService {
  async saveConversation(
    userId: string,
    lessonId?: string | null
  ): Promise<Result<Conversation, ChatError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // レッスンIDが指定されている場合、レッスンが存在するか確認
      if (lessonId) {
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .select("id")
          .eq("id", lessonId)
          .single();

        if (lessonError || !lesson) {
          return {
            success: false,
            error: {
              message: "レッスンが見つかりません",
              code: "LESSON_NOT_FOUND",
            },
          };
        }
      }

      // 会話を作成
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: userId,
          lesson_id: lessonId || null,
        } as never)
        .select()
        .single();

      if (error) {
        // RLS ポリシー違反の可能性
        if (error.code === "42501") {
          return {
            success: false,
            error: {
              message: "会話の作成権限がありません",
              code: "PERMISSION_DENIED",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "会話の作成に失敗しました",
            code: error.code || "UNKNOWN_ERROR",
          },
        };
      }

      if (!data) {
        return {
          success: false,
          error: {
            message: "会話の作成に失敗しました",
            code: "INSERT_FAILED",
          },
        };
      }

      return {
        success: true,
        data: {
          id: (data as { id: string }).id,
          userId: (data as { user_id: string }).user_id,
          lessonId: (data as { lesson_id: string | null }).lesson_id,
          createdAt: (data as { created_at: string }).created_at,
          updatedAt: (data as { updated_at: string }).updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "会話の作成中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Result<Message, ChatError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // 会話が存在するか確認
      const { data: conversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("id", conversationId)
        .single();

      if (conversationError || !conversation) {
        return {
          success: false,
          error: {
            message: "会話が見つかりません",
            code: "CONVERSATION_NOT_FOUND",
          },
        };
      }

      // 既存のメッセージ数を取得して order_index を決定
      const { data: existingMessages, error: countError } = await supabase
        .from("chat_messages")
        .select("order_index")
        .eq("conversation_id", conversationId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex =
        existingMessages && existingMessages.length > 0
          ? ((existingMessages[0] as { order_index: number }).order_index + 1)
          : 0;

      // メッセージを保存
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          role,
          content,
          order_index: nextOrderIndex,
        } as never)
        .select()
        .single();

      if (error) {
        // RLS ポリシー違反の可能性
        if (error.code === "42501") {
          return {
            success: false,
            error: {
              message: "メッセージの保存権限がありません",
              code: "PERMISSION_DENIED",
            },
          };
        }

        return {
          success: false,
          error: {
            message: "メッセージの保存に失敗しました",
            code: error.code || "UNKNOWN_ERROR",
          },
        };
      }

      if (!data) {
        return {
          success: false,
          error: {
            message: "メッセージの保存に失敗しました",
            code: "INSERT_FAILED",
          },
        };
      }

      // 会話の updated_at を更新
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() } as never)
        .eq("id", conversationId);

      return {
        success: true,
        data: {
          id: (data as { id: string }).id,
          conversationId: (data as { conversation_id: string }).conversation_id,
          role: (data as { role: string }).role as "user" | "assistant",
          content: (data as { content: string }).content,
          createdAt: (data as { created_at: string }).created_at,
          orderIndex: (data as { order_index: number }).order_index,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "メッセージの保存中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  async getConversationHistory(
    conversationId: string
  ): Promise<Result<ConversationHistory | null, ChatError>> {
    try {
      const supabase = await createServerSupabaseClient();

      // 会話情報を取得
      const { data: conversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (conversationError) {
        if (conversationError.code === "PGRST116") {
          // 会話が見つからない場合
          return {
            success: true,
            data: null,
          };
        }

        return {
          success: false,
          error: {
            message: "会話の取得に失敗しました",
            code: conversationError.code || "UNKNOWN_ERROR",
          },
        };
      }

      if (!conversation) {
        return {
          success: true,
          data: null,
        };
      }

      // メッセージ一覧を取得（order_index 順）
      const { data: messages, error: messagesError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("order_index", { ascending: true });

      if (messagesError) {
        return {
          success: false,
          error: {
            message: "メッセージの取得に失敗しました",
            code: messagesError.code || "UNKNOWN_ERROR",
          },
        };
      }

      return {
        success: true,
        data: {
          conversation: {
            id: (conversation as { id: string }).id,
            userId: (conversation as { user_id: string }).user_id,
            lessonId: (conversation as { lesson_id: string | null }).lesson_id,
            createdAt: (conversation as { created_at: string }).created_at,
            updatedAt: (conversation as { updated_at: string }).updated_at,
          },
          messages:
            messages?.map((msg) => ({
              id: (msg as { id: string }).id,
              conversationId: (msg as { conversation_id: string }).conversation_id,
              role: (msg as { role: string }).role as "user" | "assistant",
              content: (msg as { content: string }).content,
              createdAt: (msg as { created_at: string }).created_at,
              orderIndex: (msg as { order_index: number }).order_index,
            })) || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "会話履歴の取得中に予期しないエラーが発生しました",
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }
}

/**
 * ChatService のシングルトンインスタンス
 */
export const chatService: ChatService = new ChatServiceImpl();
