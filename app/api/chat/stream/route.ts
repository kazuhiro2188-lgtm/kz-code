import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { claudeService, type ChatMessage } from "@/lib/services/claude";
import { contentService } from "@/lib/services/content";
import { chatService } from "@/lib/services/chat";

/**
 * リクエストボディの型定義
 */
type ChatRequest = {
  message: string;
  lessonId?: string;
  conversationId?: string;
};

/**
 * POST /api/chat/stream
 * 
 * AI チャットストリーミング API エンドポイント
 * 
 * リクエストボディ:
 * - message: ユーザーのメッセージ（必須）
 * - lessonId: レッスンID（オプション、コンテキストとして使用）
 * - conversationId: 会話ID（オプション、既存の会話を継続する場合）
 * 
 * レスポンス:
 * - ReadableStream<StreamChunk> (ストリーミング応答)
 * 
 * エラー:
 * - 400: リクエストボディの検証エラー
 * - 401: 認証エラー
 * - 500: サーバーエラー
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // リクエストボディの取得と検証
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "リクエストボディの解析に失敗しました" },
        { status: 400 }
      );
    }

    // メッセージの検証
    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "メッセージが空です" },
        { status: 400 }
      );
    }

    // レッスンコンテキストの取得（lessonId が指定されている場合）
    let lessonContext: string | undefined;
    if (body.lessonId) {
      const contextResult = await contentService.getLessonContext(body.lessonId);
      if (contextResult.success && contextResult.data) {
        lessonContext = contextResult.data;
      }
      // エラーが発生しても続行（コンテキストなしで処理）
    }

    // 会話履歴の取得または新規作成
    let conversationId = body.conversationId;
    let conversationHistory: ChatMessage[] = [];

    if (conversationId) {
      // 既存の会話履歴を取得
      const historyResult = await chatService.getConversationHistory(conversationId);
      if (historyResult.success && historyResult.data) {
        // メッセージを ChatMessage 形式に変換
        conversationHistory = historyResult.data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
      } else {
        // 会話が見つからない場合は新規作成
        conversationId = undefined;
      }
    }

    // 会話が存在しない場合は新規作成
    if (!conversationId) {
      const conversationResult = await chatService.saveConversation(
        user.id,
        body.lessonId || null
      );
      if (!conversationResult.success) {
        return NextResponse.json(
          { error: conversationResult.error.message },
          { status: 500 }
        );
      }
      conversationId = conversationResult.data.id;
    }

    // ユーザーメッセージを会話履歴に追加
    const userMessage: ChatMessage = {
      role: "user",
      content: body.message,
    };
    const messages: ChatMessage[] = [...conversationHistory, userMessage];

    // ユーザーメッセージを保存
    const saveUserMessageResult = await chatService.saveMessage(
      conversationId,
      "user",
      body.message
    );
    if (!saveUserMessageResult.success) {
      // メッセージ保存に失敗してもストリーミングは続行
      console.error("ユーザーメッセージの保存に失敗:", saveUserMessageResult.error);
    }

    // ClaudeService を呼び出してストリーミング応答を生成
    const streamResult = await claudeService.streamResponse(messages, lessonContext);

    if (!streamResult.success) {
      return NextResponse.json(
        { error: streamResult.error.message },
        { status: 500 }
      );
    }

    // ReadableStream を SSE 形式に変換して返す
    const readableStream = streamResult.data;
    let assistantMessageContent = "";

    // ReadableStream を変換して SSE 形式で返す
    const encoder = new TextEncoder();
    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = readableStream.getReader();
          let done = false;

          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            if (value) {
              if (value.type === "text" && value.content) {
                // テキストチャンクを SSE 形式で送信
                assistantMessageContent += value.content;
                const sseData = `data: ${JSON.stringify({ type: "text", content: value.content })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              } else if (value.type === "done") {
                // ストリーム完了
                const sseData = `data: ${JSON.stringify({ type: "done" })}\n\n`;
                controller.enqueue(encoder.encode(sseData));

                // アシスタントメッセージを保存
                if (assistantMessageContent.trim().length > 0) {
                  const saveAssistantMessageResult = await chatService.saveMessage(
                    conversationId!,
                    "assistant",
                    assistantMessageContent
                  );
                  if (!saveAssistantMessageResult.success) {
                    console.error("アシスタントメッセージの保存に失敗:", saveAssistantMessageResult.error);
                  }
                }

                controller.close();
                break;
              } else if (value.type === "error") {
                // エラー発生
                const sseData = `data: ${JSON.stringify({ type: "error", error: value.error })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
                controller.close();
                break;
              }
            }
          }

          if (!done) {
            // ストリームが予期せず終了した場合
            if (assistantMessageContent.trim().length > 0) {
              const saveAssistantMessageResult = await chatService.saveMessage(
                conversationId!,
                "assistant",
                assistantMessageContent
              );
              if (!saveAssistantMessageResult.success) {
                console.error("アシスタントメッセージの保存に失敗:", saveAssistantMessageResult.error);
              }
            }
            controller.close();
          }
        } catch (error) {
          console.error("ストリーミングエラー:", error);
          const errorMessage = error instanceof Error ? error.message : "ストリーミング中にエラーが発生しました";
          const sseData = `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        }
      },
      cancel() {
        // ストリームがキャンセルされた場合のクリーンアップ
        readableStream.cancel();
      },
    });

    // SSE 形式でストリームを返す
    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API エラー:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "チャットAPIの処理中に予期しないエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
