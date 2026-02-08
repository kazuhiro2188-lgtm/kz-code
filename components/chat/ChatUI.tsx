"use client";

import { useState, useRef, useEffect } from "react";

/**
 * チャットメッセージの型定義
 */
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

/**
 * ChatUI コンポーネントの Props
 */
type ChatUIProps = {
  lessonId?: string;
  conversationId?: string;
  onConversationIdChange?: (conversationId: string) => void;
};

/**
 * ChatUI コンポーネント
 * 
 * AI チャットインターフェースを提供します。
 * - メッセージ表示エリア
 * - 入力フィールドと送信ボタン
 * - SSE ストリーミング対応
 * - 会話履歴のローカル状態管理
 * - エラーハンドリングと再試行
 * - ローディング状態の表示
 */
export default function ChatUI({
  lessonId,
  conversationId: initialConversationId,
  onConversationIdChange,
}: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 会話IDが変更されたときに親コンポーネントに通知
  useEffect(() => {
    if (currentConversationId && onConversationIdChange) {
      onConversationIdChange(currentConversationId);
    }
  }, [currentConversationId, onConversationIdChange]);

  // メッセージが追加されたときにスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  /**
   * SSE ストリームを処理します
   */
  const handleStreamResponse = async (
    userMessage: string,
    conversationId?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setStreamingMessage("");

    // ユーザーメッセージを追加
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 新しい AbortController を作成
    abortControllerRef.current = new AbortController();

    // ストリーミング中のメッセージをローカル変数で管理
    let accumulatedContent = "";

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          lessonId,
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "エラーが発生しました" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // SSE ストリームを処理
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ストリームの読み取りに失敗しました");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // チャンクをデコード
        buffer += decoder.decode(value, { stream: true });

        // SSE メッセージを解析
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // 最後の不完全な行をバッファに保持

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text" && data.content) {
                // ストリーミングテキストを累積
                accumulatedContent += data.content;
                // UIをリアルタイムで更新
                setStreamingMessage(accumulatedContent);
              } else if (data.type === "done") {
                // ストリーム完了
                if (accumulatedContent.trim().length > 0) {
                  const assistantMsg: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, assistantMsg]);
                }
                setStreamingMessage("");
                setIsLoading(false);
                return;
              } else if (data.type === "error") {
                // エラー発生
                throw new Error(data.error || "ストリーミング中にエラーが発生しました");
              }
            } catch (parseError) {
              console.error("SSE メッセージの解析エラー:", parseError);
            }
          }
        }
      }

      // ストリームが予期せず終了した場合
      if (accumulatedContent.trim().length > 0) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: accumulatedContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setStreamingMessage("");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // キャンセルされた場合はエラーを表示しない
        setStreamingMessage("");
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "メッセージの送信に失敗しました";
      setError(errorMessage);

      // ユーザーメッセージを削除（エラー時）
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * メッセージ送信ハンドラ
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const message = input.trim();
    setInput("");

    await handleStreamResponse(message, currentConversationId);
  };


  /**
   * ストリームをキャンセル
   */
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  /**
   * 再試行
   */
  const handleRetry = async () => {
    if (messages.length === 0) {
      return;
    }

    // 最後のユーザーメッセージを取得
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
    if (!lastUserMessage) {
      return;
    }

    // 最後のユーザーメッセージ以降を削除
    const lastUserIndex = messages.findIndex((msg) => msg.id === lastUserMessage.id);
    setMessages((prev) => prev.slice(0, lastUserIndex + 1));

    // 再送信
    await handleStreamResponse(lastUserMessage.content, currentConversationId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
            <p className="text-base sm:text-lg mb-2">AI アシスタントに質問してみましょう</p>
            <p className="text-xs sm:text-sm">
              {lessonId
                ? "このレッスンに関する質問に答えます"
                : "学習に関する質問に答えます"}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                message.role === "user"
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <div className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-blue-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {/* ストリーミング中のメッセージ */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <div className="whitespace-pre-wrap break-words text-sm sm:text-base">
                {streamingMessage}
                <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* スクロール用のダミー要素 */}
        <div ref={messagesEndRef} />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="px-3 sm:px-4 py-2">
          <div
            role="alert"
            className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <span>{error}</span>
              {messages.length > 0 && (
                <button
                  onClick={handleRetry}
                  className="mt-2 text-xs sm:text-sm underline hover:no-underline"
                >
                  再試行
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="メッセージ入力"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 dark:bg-red-500 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">キャンセル</span>
              <span className="sm:hidden">中止</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="送信"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
