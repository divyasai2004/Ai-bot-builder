"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BotConfig {
  id: string;
  bot_name: string;
  welcome_message: string;
  suggested_questions: string[];
  theme: string;
  primary_color: string;
  header_color: string;
  logo_url: string | null;
}

export default function PlaygroundPage() {
  const { id } = useParams();

  const [config, setConfig] =
    useState<BotConfig | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [typing, setTyping] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  const visitorId =
    useRef(
      crypto.randomUUID()
    );

  const conversationId =
    useRef(
      crypto.randomUUID()
    );

  useEffect(() => {
    async function loadBot() {
      const res = await fetch(
        `/api/widget/${id}`
      );

      const data =
        await res.json();

      if (!data.success) return;

      setConfig(data.config);

      setMessages([
        {
          role: "assistant",
          content:
            data.config
              .welcome_message,
        },
      ]);
    }

    loadBot();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(
    question: string
  ) {
    if (
      !question.trim() ||
      loading ||
      !config
    )
      return;

    const userMessage = {
      role: "user" as const,
      content: question,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");

    setLoading(true);

    setTyping(true);

    const history = [
      ...messages,
      userMessage,
    ];

    const response =
      await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          websiteId: id,
          visitorId:
            visitorId.current,
          conversationId:
            conversationId.current,
          question,
          history,
        }),
      });

    const reader =
      response.body?.getReader();

    const decoder =
      new TextDecoder();

    let aiReply = "";

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    while (true) {
      const { done, value } =
        await reader!.read();

      if (done) break;

      aiReply += decoder.decode(
        value
      );

      setMessages((prev) => {
        const updated = [...prev];

        updated[
          updated.length - 1
        ] = {
          role: "assistant",
          content: aiReply,
        };

        return updated;
      });
    }

    setTyping(false);

    setLoading(false);
  }

  function clearChat() {
    conversationId.current =
      crypto.randomUUID();

    setMessages([
      {
        role: "assistant",
        content:
          config?.welcome_message ||
          "",
      },
    ]);
  }

  if (!config)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}

      <header
        className="text-white px-6 py-4 flex justify-between items-center"
        style={{
          background:
            config.header_color ||
            "#2563eb",
        }}
      >
        <div className="flex items-center gap-3">

          <Bot size={28} />

          <div>

            <h1 className="text-xl font-bold">
              {config.bot_name}
            </h1>

            <p className="text-sm opacity-90">
              AI Playground
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            onClick={clearChat}
            className="bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <Link
            href={`/dashboard/${id}`}
            className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>

      </header>
            {/* Chat Area */}

      <div className="flex-1 overflow-y-auto p-8">

        <div className="max-w-5xl mx-auto space-y-6">

          {messages.map((message, index) => (

            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-3xl rounded-2xl px-5 py-4 whitespace-pre-wrap shadow ${
                  message.role === "user"
                    ? "text-white"
                    : "bg-white"
                }`}
                style={{
                  backgroundColor:
                    message.role === "user"
                      ? config.primary_color ||
                        "#2563eb"
                      : "#ffffff",
                }}
              >
                {message.content}
              </div>

            </div>

          ))}

          {typing && (

            <div className="flex justify-start">

              <div className="bg-white rounded-2xl px-5 py-4 shadow">

                <div className="flex gap-2">

                  <span className="animate-bounce">
                    ●
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay:
                        ".2s",
                    }}
                  >
                    ●
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay:
                        ".4s",
                    }}
                  >
                    ●
                  </span>

                </div>

              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>

      </div>

      {/* Suggested Questions */}

      {config.suggested_questions?.length >
        0 && (
        <div className="border-t bg-white px-6 py-5">

          <div className="max-w-5xl mx-auto">

            <p className="font-semibold mb-3">
              Suggested Questions
            </p>

            <div className="flex flex-wrap gap-3">

              {config.suggested_questions.map(
                (
                  question,
                  index
                ) => (
                  <button
                    key={index}
                    onClick={() =>
                      sendMessage(
                        question
                      )
                    }
                    disabled={loading}
                    className="rounded-full border px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    {question}
                  </button>
                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* Input */}

      <div className="bg-white border-t px-6 py-5">

        <div className="max-w-5xl mx-auto flex gap-3">

          <input
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                sendMessage(
                  input
                );
              }
            }}
            placeholder={`Message ${config.bot_name}...`}
            className="flex-1 border rounded-xl px-5 py-4 outline-none"
          />

          <button
            disabled={
              loading ||
              !input.trim()
            }
            onClick={() =>
              sendMessage(
                input
              )
            }
            className="text-white px-6 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor:
                config.primary_color ||
                "#2563eb",
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>

        </div>

      </div>

    </main>

  );

}