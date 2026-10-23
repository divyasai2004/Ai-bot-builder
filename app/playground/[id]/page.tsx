"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  SendHorizontal,
  MessageCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Sparkles,
  Settings,
  BookOpen,
  Copy,
  Check,
  Globe,
  Radio,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BotConfig {
  id: string;
  website_url?: string;
  industry?: string;
  business_type?: string;
  bot_name: string;
  welcome_message: string;
  suggested_questions: string[];
  theme: string;
  primary_color: string;
  header_color: string;
  logo_url: string | null;
  widget_width?: number;
  border_radius?: number;
}

export default function PlaygroundPage() {
  const { id } = useParams();

  const [config, setConfig] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [imageError, setImageError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(crypto.randomUUID());
  const conversationId = useRef(crypto.randomUUID());

  useEffect(() => {
    async function loadBot() {
      const res = await fetch(`/api/widget/${id}?preview=true`);
      const data = await res.json();

      if (!data.success) return;

      setConfig(data.config);
      setIsPaused(!!data.paused);

      setMessages([
        {
          role: "assistant",
          content: data.config.welcome_message || "Hi! How can I help you today?",
        },
      ]);
    }

    loadBot();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading || !config) return;

    const userMessage = {
      role: "user" as const,
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    const history = [...messages, userMessage];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteId: id,
          visitorId: visitorId.current,
          conversationId: conversationId.current,
          question,
          history,
          preview: true,
        }),
      });

      if (!response.ok) {
        let errMessage = "Sorry, couldn't get a response.";
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          // ignore json parse error
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errMessage,
          },
        ]);
        return;
      }

      if (!response.body) {
        throw new Error("No response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiReply = "";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        aiReply += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: aiReply,
          };

          return updated;
        });
      }
    } catch (error) {
      console.error("Playground chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
          lastMsg.content =
            error instanceof Error ? error.message : "Sorry, an error occurred while processing your request.";
          return updated;
        }
        return [
          ...prev,
          {
            role: "assistant",
            content:
              error instanceof Error ? error.message : "Sorry, an error occurred while processing your request.",
          },
        ];
      });
    } finally {
      setTyping(false);
      setLoading(false);
    }
  }

  function clearChat() {
    conversationId.current = crypto.randomUUID();

    setMessages([
      {
        role: "assistant",
        content: config?.welcome_message || "Hi! How can I help you today?",
      },
    ]);
  }

  function copyMessage(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const isDark = config?.theme === "dark";
  const primaryColor = config?.primary_color || "#2563eb";
  const headerColor = config?.header_color || "#2563eb";
  const widgetWidth = config?.widget_width || 370;
  const borderRadius = config?.border_radius || 14;
  const bubbleRadius = Math.min(borderRadius, 18);
  const hasUserMessages = messages.some((message) => message.role === "user");
  const suggestedQuestions = (config?.suggested_questions || []).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#0A0B10] text-[#F4F5F7] flex flex-col font-sans selection:bg-[#7C6CFF]/30 selection:text-white">
      {/* AMBIENT BACKGROUND LIGHTING */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-25 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #7C6CFF 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-100px] right-[-100px] h-[450px] w-[450px] rounded-full opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #22D3C8 0%, transparent 70%)",
        }}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#0E1017]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/${id}`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#8B90A0] hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-lg shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <span className="text-white/20">/</span>

          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-md bg-[#7C6CFF]/20 border border-[#7C6CFF]/30 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-[#9C93FF]" />
            </div>
            <h1 className="font-semibold text-sm sm:text-base text-white truncate">
              {config?.bot_name || "Playground"}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${id}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#B4B8C4] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Settings size={13} />
            Settings
          </Link>

          <Link
            href={`/dashboard/${id}/knowledge`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#B4B8C4] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
          >
            <BookOpen size={13} />
            Knowledge
          </Link>

          <button
            type="button"
            onClick={clearChat}
            disabled={!config}
            title="Reset conversation"
            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* PAUSED BANNER IF BOT IS PAUSED */}
      {isPaused && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>
              <strong>Bot is Paused:</strong> Website visitors cannot interact with this bot. You can test it in this studio or activate it in{" "}
              <Link href={`/dashboard/${id}`} className="underline font-medium hover:text-white">
                Bot Settings
              </Link>.
            </span>
          </div>
        </div>
      )}

      {/* MAIN PLAYGROUND BODY */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto p-3 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] gap-6 items-start">
        {/* LEFT INSPECTOR & TEST CONTROLS */}
        <aside className="space-y-4 order-2 lg:order-1">
          {/* BOT INFO CARD */}
          <div className="bg-[#12141D]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {config?.logo_url && !imageError ? (
                  <img
                    src={config.logo_url}
                    alt={config.bot_name}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bot size={24} className="text-[#9C93FF]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-base text-white truncate">
                  {config?.bot_name || "AI Assistant"}
                </h2>
                {config?.website_url && (
                  <a
                    href={config.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#7C6CFF] hover:underline truncate max-w-full"
                  >
                    <Globe size={11} className="shrink-0" />
                    <span className="truncate">{config.website_url}</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl">
                <span className="text-[#666B7A] block text-[11px]">Industry</span>
                <span className="font-medium text-white truncate block mt-0.5">
                  {config?.industry || "General"}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl">
                <span className="text-[#666B7A] block text-[11px]">Status</span>
                <span className="font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* QUICK PROMPT TESTER */}
          <div className="bg-[#12141D]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9C93FF] flex items-center gap-1.5">
                <Radio size={13} />
                Quick Test Prompts
              </h3>
              <span className="text-[11px] text-[#666B7A]">Click to send</span>
            </div>

            <p className="text-xs text-[#8B90A0] mb-3">
              Test how your assistant handles pre-configured knowledge questions:
            </p>

            <div className="space-y-2">
              {(suggestedQuestions.length > 0
                ? suggestedQuestions
                : [
                    "What products or services do you offer?",
                    "How can I contact support?",
                    "What makes your business unique?",
                  ]
              ).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl text-xs bg-white/[0.02] hover:bg-[#7C6CFF]/10 border border-white/[0.06] hover:border-[#7C6CFF]/30 text-[#D1D5DB] hover:text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{q}</span>
                  <SendHorizontal
                    size={12}
                    className="text-[#7C6CFF] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SESSION STATS */}
          <div className="bg-[#12141D]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 shadow-xl text-xs text-[#8B90A0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#22D3C8]" />
              <span>Session Messages</span>
            </div>
            <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-white/[0.05]">
              {messages.length}
            </span>
          </div>
        </aside>

        {/* RIGHT LIVE CHAT SIMULATOR */}
        <section className="order-1 lg:order-2 flex flex-col items-center justify-center">
          {!config ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-[#7C6CFF]" />
              <p className="text-sm text-[#8B90A0] mt-3">Loading simulator...</p>
            </div>
          ) : (
            <div className="w-full max-w-[500px]">
              {/* BROWSER CHROME FRAME */}
              <div className="bg-[#12141D] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
                {/* Browser Titlebar */}
                <div className="bg-[#0E1017] px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="bg-black/40 border border-white/[0.06] rounded-md px-3 py-1 text-[11px] text-[#8B90A0] font-mono truncate max-w-[280px]">
                      {config.website_url || "https://example.com"}
                    </div>
                  </div>
                </div>

                {/* SIMULATED WIDGET */}
                <div
                  className="flex flex-col transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "#090A0F" : "#ffffff",
                    color: isDark ? "#F4F5F7" : "#111827",
                  }}
                >
                  {/* WIDGET HEADER */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 text-white transition-all duration-300 select-none shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${headerColor}, ${primaryColor})`,
                    }}
                  >
                    {config.logo_url && !imageError ? (
                      <img
                        src={config.logo_url}
                        alt="Bot logo"
                        onError={() => setImageError(true)}
                        className="h-10 w-10 rounded-full bg-white object-cover ring-2 ring-white/30 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
                        <Bot size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate leading-tight">
                        {config.bot_name || "AI Assistant"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] opacity-90">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearChat}
                      title="Clear chat"
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Clear chat"
                    >
                      ×
                    </button>
                  </div>

                  {/* MESSAGES STREAM AREA */}
                  <div
                    className="h-[430px] sm:h-[480px] overflow-y-auto p-4 space-y-4 transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? "#0B0D14" : "#F8FAFC",
                    }}
                  >
                    {messages.map((message, index) => {
                      const isLast = index === messages.length - 1;
                      const isEmptyAssistant =
                        message.role === "assistant" && !message.content.trim();
                      const showTypingBubble = isLast && isEmptyAssistant && typing;

                      if (isEmptyAssistant && !showTypingBubble) {
                        return null;
                      }

                      const isUser = message.role === "user";

                      return (
                        <div
                          key={`${message.role}-${index}`}
                          className={`flex group ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300 ${
                              isUser ? "max-w-[82%] text-white" : "max-w-[88%]"
                            }`}
                            style={{
                              backgroundColor: isUser
                                ? primaryColor
                                : isDark
                                  ? "#181B26"
                                  : "#ffffff",
                              color: isUser
                                ? "#ffffff"
                                : isDark
                                  ? "#EDEFF4"
                                  : "#0F172A",
                              borderRadius: `${bubbleRadius}px`,
                              border: isUser
                                ? "none"
                                : isDark
                                  ? "1px solid rgba(255, 255, 255, 0.08)"
                                  : "1px solid #E2E8F0",
                            }}
                          >
                            {showTypingBubble ? (
                              <div className="flex items-center gap-1.5 py-1 px-1">
                                <span
                                  className="h-2 w-2 rounded-full animate-bounce"
                                  style={{
                                    backgroundColor: isDark ? "#8B90A0" : "#94a3b8",
                                  }}
                                />
                                <span
                                  className="h-2 w-2 rounded-full animate-bounce"
                                  style={{
                                    backgroundColor: isDark ? "#8B90A0" : "#94a3b8",
                                    animationDelay: "0.2s",
                                  }}
                                />
                                <span
                                  className="h-2 w-2 rounded-full animate-bounce"
                                  style={{
                                    backgroundColor: isDark ? "#8B90A0" : "#94a3b8",
                                    animationDelay: "0.4s",
                                  }}
                                />
                              </div>
                            ) : (
                              <>
                                <div className="whitespace-pre-wrap">{message.content}</div>

                                {!isUser && message.content && (
                                  <button
                                    type="button"
                                    onClick={() => copyMessage(message.content, index)}
                                    title="Copy text"
                                    className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#12141D] hover:bg-[#1A1E2B] border border-white/10 rounded-md p-1 text-[#8B90A0] hover:text-white"
                                  >
                                    {copiedId === index ? (
                                      <Check size={11} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* SUGGESTION CHIPS (IF ONLY WELCOME MESSAGE) */}
                    {!hasUserMessages && suggestedQuestions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={`${question}-${index}`}
                            type="button"
                            onClick={() => sendMessage(question)}
                            disabled={loading}
                            className="rounded-full border px-3 py-1.5 text-left text-xs transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                            style={{
                              borderColor: primaryColor,
                              color: primaryColor,
                              backgroundColor: isDark
                                ? "rgba(255,255,255,0.04)"
                                : "#ffffff",
                            }}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* BOTTOM INPUT BAR */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="p-3 border-t flex items-center gap-2 transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? "#0E1017" : "#ffffff",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "#E2E8F0",
                    }}
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      placeholder={`Message ${config.bot_name || "assistant"}...`}
                      className="min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                      style={{
                        backgroundColor: isDark ? "#161922" : "#F1F5F9",
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        border: isDark
                          ? "1px solid rgba(255, 255, 255, 0.08)"
                          : "1px solid #E2E8F0",
                      }}
                    />

                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
                      style={{
                        backgroundColor: primaryColor,
                      }}
                      aria-label="Send message"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <SendHorizontal size={16} />
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* LAUNCHER PREVIEW */}
              <div className="mt-5 flex flex-col items-center justify-center">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {config.logo_url ? (
                    <img
                      src={config.logo_url}
                      alt="Launcher"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MessageCircle size={25} />
                  )}
                </div>
                <p className="mt-2 text-xs text-[#666B7A]">
                  Launcher floating button preview
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
