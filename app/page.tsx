"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import {
  Bot,
  Globe,
  Sparkles,
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Code2,
  BrainCircuit,
  Database,
  Sliders,
  BarChart3,
  Check,
  Copy,
  ChevronDown,
  RefreshCw,
  Send,
  Terminal,
  Layers,
  Lock,
  ExternalLink,
  MessageSquare,
  Activity,
} from "lucide-react";
import Link from "next/link";

/* =========================================================
   AMBIENT COSMIC BACKGROUND & GLOW EFFECTS
========================================================= */
function AmbientCosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#07080D]"
    >
      {/* Primary Top Violet Aurora Bloom */}
      <div
        className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full opacity-30 blur-[150px] animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, #7C6CFF 0%, rgba(34, 211, 200, 0.2) 45%, transparent 70%)",
        }}
      />

      {/* Left Warm Amber/Coral Bloom */}
      <div
        className="absolute top-[28%] -left-48 w-[650px] h-[650px] rounded-full opacity-15 blur-[160px]"
        style={{
          background: "radial-gradient(circle, #FF6B4A 0%, transparent 70%)",
        }}
      />

      {/* Right Cyber Cyan Bloom */}
      <div
        className="absolute top-[52%] -right-48 w-[700px] h-[700px] rounded-full opacity-15 blur-[160px]"
        style={{
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
        }}
      />

      {/* Bottom Center Violet Anchor Bloom */}
      <div
        className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #7C6CFF 0%, transparent 75%)",
        }}
      />

      {/* High-Tech Geometric Dot Matrix Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle Radial Vignette for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,8,13,0.92)_100%)]" />
    </div>
  );
}

/* =========================================================
   FLOATING INTERACTIVE MASCOT WITH TYPING SPEECH BUBBLE
========================================================= */
function FloatingBotMascot() {
  const phrases = [
    "Ask me anything about your site",
    "Sub-300ms Groq streaming response",
    "Zero hallucinations • 100% grounded",
    "Embed anywhere with 1 line of code",
  ];

  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length];
    const delay = deleting ? 35 : 75;

    if (!deleting && text === current) {
      const holdTimeout = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(holdTimeout);
    }

    if (deleting && text === "") {
      const nextPhraseTimeout = setTimeout(() => {
        setDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, 0);
      return () => clearTimeout(nextPhraseTimeout);
    }

    const timeout = setTimeout(() => {
      setText((t) =>
        deleting
          ? current.slice(0, t.length - 1)
          : current.slice(0, t.length + 1)
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIndex]);

  return (
    <div className="hidden lg:block pointer-events-none fixed bottom-7 right-7 z-30 animate-float-slow">
      <div className="relative group">
        {/* Speech bubble */}
        <div className="absolute -top-14 right-2 min-w-[220px] bg-[#121522]/95 backdrop-blur-xl border border-white/15 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5EEAD4] animate-ping" />
            <p className="font-mono text-xs text-[#5EEAD4] whitespace-nowrap">
              {text}
              <span className="inline-block w-1.5 h-3.5 bg-[#5EEAD4] ml-0.5 align-middle animate-pulse" />
            </p>
          </div>
        </div>

        {/* Mascot Avatar Card */}
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#121626] to-[#1C2238] border border-white/20 p-2 shadow-2xl flex items-center justify-center">
          <div className="h-full w-full rounded-xl bg-gradient-to-br from-[#7C6CFF]/30 to-[#5EEAD4]/30 border border-white/10 flex items-center justify-center text-[#5EEAD4]">
            <Bot size={28} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INTERACTIVE SIMULATED CHATBOT SANDBOX COMPONENT (HERO)
========================================================= */
interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  source?: string;
  latency?: string;
}

const PRESET_CONVERSATIONS: Record<
  string,
  { answer: string; source: string; latency: string }
> = {
  pricing: {
    answer:
      "We provide two simple plans: Free tier includes 1 bot and 50 conversations. Pro tier unlocks unlimited bots, custom branding, multi-page indexing, and full API access for $29/mo.",
    source: "https://your-store.com/pricing",
    latency: "260ms",
  },
  rag: {
    answer:
      "Our autonomous pipeline scrapes your website, converts HTML into semantic chunks, and stores 768-D vectors in Supabase pgvector. Groq LLM streams answers strictly grounded in these facts.",
    source: "https://your-store.com/docs/architecture",
    latency: "285ms",
  },
  customization: {
    answer:
      "Yes! Customize primary colors, header styles, welcome greetings, bot avatar logos, and chat bubble roundedness from Bot Settings in real time.",
    source: "https://your-store.com/docs/styling",
    latency: "310ms",
  },
  embed: {
    answer:
      "Embedding takes 10 seconds: paste our `<script src='.../embed.js' data-bot-id='...'></script>` right before your `</body>` tag on Webflow, WordPress, Shopify, or React.",
    source: "https://your-store.com/docs/embed",
    latency: "240ms",
  },
};

function HeroInteractiveSimulator() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hi there! I am your AI assistant grounded strictly in your website data. How can I help you today?",
    },
    {
      id: "2",
      sender: "user",
      text: "What features are included in the Pro tier?",
    },
    {
      id: "3",
      sender: "bot",
      text: "The Pro tier includes unlimited bot queries, custom branding, multi-page crawling, priority support, and complete analytics export.",
      source: "https://your-store.com/pricing",
      latency: "275ms",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  function handleSend(promptText?: string) {
    const textToSend = (promptText || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Determine smart matching preset or default fallback
    let matchKey = "pricing";
    const lower = textToSend.toLowerCase();
    if (lower.includes("rag") || lower.includes("how") || lower.includes("work")) {
      matchKey = "rag";
    } else if (lower.includes("color") || lower.includes("custom") || lower.includes("style")) {
      matchKey = "customization";
    } else if (lower.includes("embed") || lower.includes("install") || lower.includes("script")) {
      matchKey = "embed";
    }

    const matched = PRESET_CONVERSATIONS[matchKey];

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: matched.answer,
          source: matched.source,
          latency: matched.latency,
        },
      ]);
      setIsTyping(false);
    }, 700);
  }

  function handleReset() {
    setMessages([
      {
        id: "1",
        sender: "bot",
        text: "Hi there! I am your AI assistant grounded strictly in your website data. How can I help you today?",
      },
    ]);
  }

  return (
    <div className="relative">
      {/* Outer ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#7C6CFF]/25 via-[#22D3C8]/15 to-[#FF6B4A]/20 rounded-3xl blur-2xl -z-10" />

      {/* Main Glassmorphic Container Frame */}
      <div className="bg-[#111422]/90 border border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl">
        {/* macOS Browser Header */}
        <div className="bg-[#0C0F1A] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <div className="bg-black/50 border border-white/[0.08] rounded-lg px-3 py-1 flex items-center gap-2 text-xs font-mono text-[#8B91A4] max-w-[240px] truncate">
            <Lock size={11} className="text-emerald-400 shrink-0" />
            <span className="truncate">https://your-store.com/assistant</span>
          </div>

          <button
            onClick={handleReset}
            title="Reset sandbox demo"
            className="text-[#6C7286] hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Dual Sub-sections: Live Crawler Telemetry + Active Interactive Chat */}
        <div className="p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#111422] to-[#0A0D17]">
          {/* Top: Simulated Scraper Telemetry Bar */}
          <div className="relative border border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl overflow-hidden">
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#5EEAD4] to-transparent animate-radar-sweep pointer-events-none" />

            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono text-[#5EEAD4] flex items-center gap-1.5 font-semibold">
                <Search size={12} /> Autonomous Crawl Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <Activity size={10} /> 100% Synced
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-[#161A28] border border-white/[0.06] p-2 rounded-xl">
                <p className="text-[#8B91A4] text-[9px] uppercase">Indexed</p>
                <p className="font-bold text-white mt-0.5">3 Key Pages</p>
              </div>
              <div className="bg-[#161A28] border border-white/[0.06] p-2 rounded-xl">
                <p className="text-[#8B91A4] text-[9px] uppercase">Vectors</p>
                <p className="font-bold text-[#5EEAD4] mt-0.5">768-D pgvector</p>
              </div>
              <div className="bg-[#161A28] border border-white/[0.06] p-2 rounded-xl">
                <p className="text-[#8B91A4] text-[9px] uppercase">Latency</p>
                <p className="font-bold text-[#A78BFA] mt-0.5">&lt; 300ms Groq</p>
              </div>
            </div>
          </div>

          {/* Bottom: Live Interactive Widget Box */}
          <div className="border border-white/15 bg-[#141728] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[340px]">
            {/* Widget Header */}
            <div className="bg-gradient-to-r from-[#7C6CFF] to-[#6366F1] px-4 py-2.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs backdrop-blur-sm">
                  <Bot size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Smart Assistant</p>
                  <p className="text-[10px] opacity-90 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Grounded RAG
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono bg-black/25 px-2 py-0.5 rounded-full text-white/90">
                Llama 3.3 70B
              </span>
            </div>

            {/* Chat Messages Scrollable Feed */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs bg-[#090C16]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                      m.sender === "user"
                        ? "bg-[#7C6CFF] text-white rounded-tr-sm font-medium"
                        : "bg-[#181C2E] border border-white/10 text-[#E2E6F0] rounded-tl-sm shadow-md"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.source && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8B91A4]">
                        <span className="font-mono text-[#5EEAD4] truncate max-w-[170px]">
                          ✓ {m.source.replace("https://", "")}
                        </span>
                        <span className="font-mono text-[#A78BFA] shrink-0">
                          ⚡ {m.latency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#181C2E] border border-white/10 text-[#8B91A4] px-3.5 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4] animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4] animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] font-mono ml-1 text-[#5EEAD4]">
                      Synthesizing facts...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick interactive test chips */}
            <div className="bg-[#0C0F1E] px-3 py-1.5 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] text-[#6C7286] shrink-0">Try:</span>
              <button
                type="button"
                onClick={() => handleSend("What is your pricing?")}
                className="text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A7B8] hover:text-[#5EEAD4] border border-white/[0.06] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors"
              >
                Pricing?
              </button>
              <button
                type="button"
                onClick={() => handleSend("How does RAG work?")}
                className="text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A7B8] hover:text-[#5EEAD4] border border-white/[0.06] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors"
              >
                How RAG works?
              </button>
              <button
                type="button"
                onClick={() => handleSend("Can I customize the colors?")}
                className="text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A7B8] hover:text-[#5EEAD4] border border-white/[0.06] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors"
              >
                Custom colors?
              </button>
              <button
                type="button"
                onClick={() => handleSend("How do I embed it?")}
                className="text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A7B8] hover:text-[#5EEAD4] border border-white/[0.06] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors"
              >
                1-line embed?
              </button>
            </div>

            {/* Input bar */}
            <div className="bg-[#0F1324] p-2 border-t border-white/10 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Ask this demo bot anything..."
                className="flex-1 bg-transparent text-xs text-white placeholder-[#5C6378] outline-none px-2 font-sans"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="h-7 w-7 rounded-lg bg-[#7C6CFF] hover:bg-[#6857F8] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INTERACTIVE 1-LINE EMBED CODE SHOWCASE
========================================================= */
function EmbedCodeShowcase() {
  const [activeTab, setActiveTab] = useState<"script" | "react" | "next" | "webflow">("script");
  const [copied, setCopied] = useState(false);

  const snippets = {
    script: `<!-- Paste anywhere before </body> -->
<script
  src="https://ai-bot-builder.app/embed.js"
  data-bot-id="8844145e-06dc-428c-be58-45b266b678b2"
  async
></script>`,
    react: `// In your React App or layout
import { useEffect } from "react";

export function BotWidget() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://ai-bot-builder.app/embed.js";
    s.setAttribute("data-bot-id", "8844145e-06dc-428c-be58-45b266b678b2");
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return null;
}`,
    next: `// In Next.js App Router (app/layout.tsx)
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://ai-bot-builder.app/embed.js"
          data-bot-id="8844145e-06dc-428c-be58-45b266b678b2"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
    webflow: `<!-- In Webflow / WordPress / Shopify Custom Code -->
<!-- Footer Code Section -->
<script
  src="https://ai-bot-builder.app/embed.js"
  data-bot-id="8844145e-06dc-428c-be58-45b266b678b2"
  defer
></script>`,
  };

  function copyCode() {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#101322] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header with Language Tabs */}
      <div className="bg-[#0C0F1C] px-4 py-3 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          {(
            [
              { key: "script", label: "HTML Script Tag" },
              { key: "next", label: "Next.js" },
              { key: "react", label: "React" },
              { key: "webflow", label: "Webflow / Shopify" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#7C6CFF] text-white shadow-md shadow-[#7C6CFF]/30 font-semibold"
                  : "text-[#8B91A4] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white px-3.5 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-[#A78BFA]" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippet Box */}
      <div className="p-5 font-mono text-xs text-[#E1E5F2] overflow-x-auto leading-relaxed bg-[#080A14]">
        <pre>{snippets[activeTab]}</pre>
      </div>
    </div>
  );
}

/* =========================================================
   FAQ ACCORDION COMPONENT
========================================================= */
interface FaqItem {
  q: string;
  a: string;
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: "How does AI Bot Builder crawl and read my website?",
      a: "When you enter your URL, our autonomous crawler visits your pages, extracts the text, strips navigation menus and footer noise, chunks the content logically, and indexes it into 768-dimensional AI vector embeddings in Supabase pgvector.",
    },
    {
      q: "Will the AI chatbot hallucinate or invent false facts?",
      a: "No. Our RAG (Retrieval-Augmented Generation) pipeline feeds only your extracted text chunks into the context window. The system prompt strictly prohibits speculation: if information is not found in your indexed documents, the bot politely clarifies that.",
    },
    {
      q: "Can I add more knowledge files like PDFs or TXT documents?",
      a: "Yes! In your bot's Knowledge Base dashboard, you can upload custom TXT, Markdown, or product docs at any time. The bot merges web data and uploaded documentation seamlessly into its knowledge index.",
    },
    {
      q: "How fast are the bot's chat responses?",
      a: "Responses are powered by Groq LPUs running Llama 3.3 70B inference. Perceived latency is under 300ms, and responses stream back word-by-word with instant fluid typing.",
    },
    {
      q: "Can I customize the bot's look to match my website branding?",
      a: "Absolutely. You can customize the bot name, primary theme color, header gradients, welcome greeting, bot avatar, and corner border radius directly from the dashboard visual studio.",
    },
    {
      q: "What website platforms are supported for embedding?",
      a: "Every platform that supports HTML or JavaScript! That includes Webflow, Shopify, WordPress, Squarespace, Framer, Wix, custom React/Vue apps, Next.js, and static HTML pages.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-[#7C6CFF]/40 bg-[#121626]"
                : "border-white/[0.08] bg-[#0E111E] hover:border-white/15"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4"
            >
              <span className="font-semibold text-sm sm:text-base text-white">
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                className={`text-[#8B91A4] shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-[#5EEAD4]" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-[#949AA8] leading-relaxed border-t border-white/[0.04]">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   MAIN LANDING PAGE
========================================================= */
export default function LandingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [inputUrl, setInputUrl] = useState("");
  const [activeTheme, setActiveTheme] = useState<
    "violet" | "emerald" | "cyan" | "coral" | "gold"
  >("violet");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setUser(user);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  function handleStart(targetUrl?: string) {
    const finalUrl = targetUrl || inputUrl;
    if (finalUrl.trim()) {
      if (user) {
        router.push(`/create?url=${encodeURIComponent(finalUrl.trim())}`);
      } else {
        router.push(
          `/login?redirect=${encodeURIComponent(
            `/create?url=${encodeURIComponent(finalUrl.trim())}`
          )}`
        );
      }
    } else {
      if (user) {
        router.push("/create");
      } else {
        router.push("/login");
      }
    }
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.refresh();
  }

  const themes = {
    violet: {
      name: "Electric Violet",
      primary: "#7C6CFF",
      accent: "#A78BFA",
      gradient: "from-[#7C6CFF] to-[#6366F1]",
    },
    emerald: {
      name: "Cyber Mint",
      primary: "#10B981",
      accent: "#34D399",
      gradient: "from-[#10B981] to-[#059669]",
    },
    cyan: {
      name: "Cosmic Cyan",
      primary: "#06B6D4",
      accent: "#5EEAD4",
      gradient: "from-[#06B6D4] to-[#0EA5E9]",
    },
    coral: {
      name: "Neon Sunset",
      primary: "#FF6B4A",
      accent: "#FB7185",
      gradient: "from-[#FF6B4A] to-[#F43F5E]",
    },
    gold: {
      name: "Solar Gold",
      primary: "#F59E0B",
      accent: "#FCD34D",
      gradient: "from-[#F59E0B] to-[#D97706]",
    },
  };

  return (
    <main className="relative min-h-screen text-[#ECEFF6] font-sans selection:bg-[#7C6CFF]/30 selection:text-white">
      <AmbientCosmicBackground />
      <FloatingBotMascot />

      {/* =========================================================
          TOP FLOATING NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="bg-[#101322]/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C6CFF] via-[#5EEAD4] to-[#FF6B4A] p-[1.5px] shadow-lg shadow-[#7C6CFF]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0D0F19] rounded-[10px] flex items-center justify-center text-[#5EEAD4]">
                <Bot size={20} strokeWidth={2.4} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Bot Builder
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#7C6CFF]/15 text-[#5EEAD4] border border-[#7C6CFF]/30 font-semibold">
                  v2.0
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs sm:text-sm text-[#8B91A4]">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Sandbox
            </a>
            <a
              href="#embed-code"
              className="hover:text-white transition-colors"
            >
              Embed 1-Line
            </a>
            <a href="#customizer" className="hover:text-white transition-colors">
              Themes
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {!loadingUser && !user && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#8B91A4] hover:text-white transition-colors"
                >
                  Log in
                </Link>

                <button
                  type="button"
                  onClick={() => handleStart()}
                  className="text-xs sm:text-sm bg-gradient-to-r from-[#7C6CFF] to-[#5EEAD4] hover:brightness-110 text-[#07080D] px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-[#7C6CFF]/25 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Build Bot</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}

            {!loadingUser && user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs sm:text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3.5 py-2 rounded-xl font-medium transition-colors"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-[#8B91A4] hover:text-white px-2.5 py-2 transition-colors"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy & Interactive Launcher */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 border border-[#7C6CFF]/30 bg-[#7C6CFF]/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A78BFA] shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5EEAD4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5EEAD4]"></span>
              </span>
              <span>Autonomous Website RAG • Zero Training Code</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.07]">
              Your website already knows the answers.{" "}
              <span className="bg-gradient-to-r from-[#5EEAD4] via-[#7C6CFF] to-[#FF6B4A] bg-clip-text text-transparent">
                Give it a voice with AI.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#949AA8] max-w-xl leading-relaxed">
              Point it at a URL. We crawl the content, turn it into searchable
              vector knowledge, and hand you a chat assistant that actually
              knows your product — ready to embed anywhere in 30 seconds.
            </p>

            {/* LIVE URL GENERATOR INPUT */}
            <div className="pt-2 max-w-xl">
              <div className="bg-[#121526]/90 border border-white/20 p-2 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row gap-2 transition-all focus-within:border-[#7C6CFF]/70 focus-within:ring-2 focus-within:ring-[#7C6CFF]/20">
                <div className="flex items-center gap-2.5 px-3 flex-1 min-w-0">
                  <Globe size={18} className="text-[#5EEAD4] shrink-0" />
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStart();
                    }}
                    placeholder="https://yourcompany.com"
                    className="w-full bg-transparent text-sm text-white placeholder-[#555C6D] outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStart()}
                  className="bg-gradient-to-r from-[#FF6B4A] to-[#FF896B] hover:brightness-110 active:scale-95 text-[#07080D] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B4A]/30 transition-all shrink-0"
                >
                  Build your AI bot
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Sample quick picks */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6F7585]">
                <span>Try with:</span>
                {[
                  "stripe.com",
                  "linear.app",
                  "github.com",
                  "supabase.com",
                  "openai.com",
                ].map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      setInputUrl(`https://${domain}`);
                      handleStart(`https://${domain}`);
                    }}
                    className="font-mono text-[#A1A7B8] hover:text-[#5EEAD4] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-2.5 py-0.5 rounded-md transition-colors"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* TRUST / CAPABILITY PILLS */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-[#949AA8]">
                <Zap size={14} className="text-[#FF6B4A]" />
                <span>&lt; 30s Setup</span>
              </div>
              <div className="flex items-center gap-2 text-[#949AA8]">
                <ShieldCheck size={14} className="text-[#5EEAD4]" />
                <span>Zero Hallucinations</span>
              </div>
              <div className="flex items-center gap-2 text-[#949AA8]">
                <Code2 size={14} className="text-[#7C6CFF]" />
                <span>1-Line Embed Script</span>
              </div>
              <div className="flex items-center gap-2 text-[#949AA8]">
                <BrainCircuit size={14} className="text-[#22D3C8]" />
                <span>Groq Llama 3.3 RAG</span>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Simulator */}
          <div id="demo" className="lg:col-span-5">
            <HeroInteractiveSimulator />
          </div>
        </div>
      </section>

      {/* =========================================================
          KEY STATS STRIP
      ========================================================= */}
      <section className="border-y border-white/[0.08] bg-[#0A0D18]/70 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                30s
              </p>
              <p className="text-xs sm:text-sm text-[#8B91A4] mt-1">
                Average Crawl to Embed Time
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#5EEAD4] font-mono">
                &lt; 300ms
              </p>
              <p className="text-xs sm:text-sm text-[#8B91A4] mt-1">
                Groq Token Streaming Latency
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#A78BFA] font-mono">
                100%
              </p>
              <p className="text-xs sm:text-sm text-[#8B91A4] mt-1">
                Grounded in Scraped Facts
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FF6B4A] font-mono">
                1 Line
              </p>
              <p className="text-xs sm:text-sm text-[#8B91A4] mt-1">
                Drop-in Universal Code Tag
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS (NEURAL PIPELINE)
      ========================================================= */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-28"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#5EEAD4] bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 px-3.5 py-1 rounded-full font-semibold">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            From raw URL to live chatbot in 3 steps
          </h2>
          <p className="text-sm sm:text-base text-[#8B91A4]">
            Our autonomous pipeline orchestrates web scraping, noise
            distillation, vector embeddings, and streaming LLM generation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-[#111422] border border-white/[0.08] hover:border-[#7C6CFF]/50 p-8 rounded-3xl transition-all duration-300 group hover:-translate-y-1.5 shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#7C6CFF]/15 border border-[#7C6CFF]/30 text-[#7C6CFF] flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <span className="text-xs font-mono text-[#5EEAD4] font-semibold">
              STEP 01
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2.5">
              Deep Web Scraping
            </h3>
            <p className="text-sm text-[#8B91A4] leading-relaxed mb-4">
              Enter your domain. Our scraper strips navigational clutter,
              extracts pure markdown text, and segments your pages into
              manageable chunks.
            </p>
            <div className="bg-[#0A0D17] p-3 rounded-xl border border-white/[0.06] text-[11px] font-mono text-[#7E8599]">
              <span className="text-emerald-400">✓</span> Parsed pricing, FAQs &
              docs
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111422] border border-white/[0.08] hover:border-[#5EEAD4]/50 p-8 rounded-3xl transition-all duration-300 group hover:-translate-y-1.5 shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#5EEAD4]/15 border border-[#5EEAD4]/30 text-[#5EEAD4] flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit size={24} />
            </div>
            <span className="text-xs font-mono text-[#5EEAD4] font-semibold">
              STEP 02
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2.5">
              Semantic Vector Index
            </h3>
            <p className="text-sm text-[#8B91A4] leading-relaxed mb-4">
              Content is encoded into 768-dimensional AI vector embeddings via
              Gemini and stored in Supabase pgvector for sub-second semantic
              similarity lookup.
            </p>
            <div className="bg-[#0A0D17] p-3 rounded-xl border border-white/[0.06] text-[11px] font-mono text-[#7E8599]">
              <span className="text-[#5EEAD4]">✓</span> Stored in Supabase
              pgvector
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111422] border border-white/[0.08] hover:border-[#FF6B4A]/50 p-8 rounded-3xl transition-all duration-300 group hover:-translate-y-1.5 shadow-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 text-[#FF6B4A] flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Code2 size={24} />
            </div>
            <span className="text-xs font-mono text-[#5EEAD4] font-semibold">
              STEP 03
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2.5">
              1-Line Drop-in Embed
            </h3>
            <p className="text-sm text-[#8B91A4] leading-relaxed mb-4">
              Copy one HTML script tag to your site. Visitors immediately
              interact with a customized, responsive assistant streaming
              answers in real time.
            </p>
            <div className="bg-[#0A0D17] p-3 rounded-xl border border-white/[0.06] text-[11px] font-mono text-[#7E8599]">
              <span className="text-[#FF6B4A]">✓</span> Compatible with all
              frameworks
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENTO GRID OF CORE PLATFORM FEATURES
      ========================================================= */}
      <section
        id="features"
        className="border-t border-white/[0.08] bg-[#0A0D18]/60 py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7C6CFF] bg-[#7C6CFF]/10 border border-[#7C6CFF]/20 px-3.5 py-1 rounded-full font-semibold">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Engineered for speed, privacy, and control
            </h2>
            <p className="text-sm sm:text-base text-[#8B91A4]">
              Everything you need to deliver an enterprise-grade AI assistant
              without maintaining ML infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#7C6CFF]/10 border border-[#7C6CFF]/20 text-[#A78BFA] flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Sub-Second Streaming
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Powered by Groq LPUs running Llama 3.3 for lightning-fast
                streaming responses with zero perceived wait time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 text-[#5EEAD4] flex items-center justify-center">
                <Database size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Hybrid Knowledge Hub
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Supplement crawled web data by uploading custom TXT, Markdown,
                or documentation files with automatic chunk management.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Live Visual Studio
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Change primary colors, header palettes, logo uploads, corner
                roundness, and welcome greetings in real time with live preview.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#22D3C8]/10 border border-[#22D3C8]/20 text-[#22D3C8] flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Query Analytics
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Track inquiry volume, top customer questions, 7-day conversation
                trends, and export conversation transcripts to CSV.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#C084FC] flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Strict Fact Grounding
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Bots are instructed to answer strictly based on indexed facts. If
                information is missing, they state it transparently.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#111422] border border-white/[0.08] hover:border-white/20 p-7 rounded-3xl transition-all space-y-4 hover:shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Dual-Pane Playground
              </h3>
              <p className="text-sm text-[#8B91A4] leading-relaxed">
                Test queries and responses inside an interactive sandbox
                simulator with quick test prompts before rolling out to
                production.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTERACTIVE 1-LINE EMBED CODE SECTION
      ========================================================= */}
      <section id="embed-code" className="max-w-7xl mx-auto px-4 sm:px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B4A] bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 px-3.5 py-1 rounded-full font-semibold">
            Seamless Integration
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Embed on any site in seconds
          </h2>
          <p className="text-sm sm:text-base text-[#8B91A4]">
            Copy one clean code snippet. No complex npm packages or build steps
            required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <EmbedCodeShowcase />
        </div>
      </section>

      {/* =========================================================
          INTERACTIVE CUSTOMIZER SHOWCASE
      ========================================================= */}
      <section
        id="customizer"
        className="border-t border-white/[0.08] bg-[#0A0D18]/80 py-24"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5EEAD4] bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 px-3.5 py-1 rounded-full font-semibold">
              Live Theme Studio
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Matches any brand aesthetic
            </h2>
            <p className="text-sm sm:text-base text-[#8B91A4]">
              Switch theme presets below to see how the assistant widget
              seamlessly transforms.
            </p>
          </div>

          {/* Theme switcher tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => {
              const th = themes[key];
              const isSelected = activeTheme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTheme(key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-white text-[#0A0D18] shadow-lg shadow-white/20 scale-105"
                      : "bg-white/[0.04] text-[#8B91A4] hover:text-white border border-white/[0.08]"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: th.primary }}
                  />
                  {th.name}
                </button>
              );
            })}
          </div>

          {/* Theme Preview Card */}
          <div className="max-w-md mx-auto bg-[#141728] border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">
            <div
              className={`px-5 py-4 text-white flex items-center justify-between transition-all duration-300 bg-gradient-to-r ${themes[activeTheme].gradient}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">
                    Your Assistant
                  </p>
                  <p className="text-[11px] opacity-90 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online & Ready
                  </p>
                </div>
              </div>
              <span className="text-xs bg-black/25 px-2.5 py-1 rounded-full font-mono text-white/90">
                {themes[activeTheme].primary}
              </span>
            </div>

            <div className="p-5 space-y-3 bg-[#0A0D18] text-xs">
              <div className="flex justify-start">
                <div className="bg-[#171B2B] text-[#D1D5DB] px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-white/[0.08]">
                  Hello! How can I help you explore our services today?
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm font-medium transition-colors"
                  style={{ backgroundColor: themes[activeTheme].primary }}
                >
                  Can I customize the primary color and placement?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[#171B2B] text-[#D1D5DB] px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-white/[0.08]">
                  Yes! Choose any hex color, logo upload, and corner radius
                  directly from Bot Settings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COMPARISON TABLE: TRADITIONAL VS AI BOT BUILDER
      ========================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#7C6CFF] bg-[#7C6CFF]/10 border border-[#7C6CFF]/20 px-3.5 py-1 rounded-full font-semibold">
            The Difference
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Why AI Bot Builder wins
          </h2>
          <p className="text-sm sm:text-base text-[#8B91A4]">
            Compare traditional brittle chatbot builders with our autonomous
            RAG engine.
          </p>
        </div>

        <div className="border border-white/15 bg-[#101322] rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-[#0C0F1C] px-6 py-4 border-b border-white/[0.08] text-xs font-mono uppercase tracking-wider text-[#8B91A4]">
            <div className="col-span-4 sm:col-span-5">Feature</div>
            <div className="col-span-4 sm:col-span-3 text-red-400">
              Legacy Chatbots
            </div>
            <div className="col-span-4 sm:col-span-4 text-[#5EEAD4] font-bold">
              AI Bot Builder
            </div>
          </div>

          <div className="divide-y divide-white/[0.06] text-xs sm:text-sm">
            {[
              {
                feature: "Setup Process",
                legacy: "Hours of manual decision trees",
                modern: "Instant 30s automatic website crawl",
              },
              {
                feature: "Knowledge Base",
                legacy: "Fragile keyword matching",
                modern: "768-D semantic vector RAG",
              },
              {
                feature: "Response Speed",
                legacy: "Static rule replies",
                modern: "< 300ms Groq token streaming",
              },
              {
                feature: "Maintenance",
                legacy: "Re-edit trees on every product change",
                modern: "1-Click Re-crawl sync",
              },
              {
                feature: "Code Integration",
                legacy: "Heavy SDKs and complex scripts",
                modern: "1 clean lightweight script tag",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-4 sm:col-span-5 font-medium text-white">
                  {row.feature}
                </div>
                <div className="col-span-4 sm:col-span-3 text-[#7C8296] text-xs">
                  {row.legacy}
                </div>
                <div className="col-span-4 sm:col-span-4 text-[#5EEAD4] font-semibold text-xs flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>{row.modern}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ ACCORDION SECTION
      ========================================================= */}
      <section id="faq" className="border-t border-white/[0.08] bg-[#0A0D18]/70 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5EEAD4] bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 px-3.5 py-1 rounded-full font-semibold">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Everything you need to know
            </h2>
            <p className="text-sm sm:text-base text-[#8B91A4]">
              Common questions about crawling, embeddings, privacy, and widget
              embedding.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION BANNER
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-28">
        <div className="relative rounded-3xl border border-white/20 bg-gradient-to-b from-[#141829] to-[#0D101C] p-10 sm:p-20 text-center overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
          {/* Ambient glow behind headline */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#7C6CFF]/30 via-[#5EEAD4]/20 to-[#FF6B4A]/25 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-block text-xs font-mono uppercase tracking-widest text-[#5EEAD4] bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 px-3.5 py-1 rounded-full mb-6 font-semibold">
            Get Started In Seconds
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Ready to give your website an intelligent voice?
          </h2>

          <p className="mt-4 text-[#8B91A4] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Generate your first conversational assistant right now. No coding,
            no manual training sets, and zero hassle.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleStart()}
              className="w-full sm:w-auto bg-gradient-to-r from-[#FF6B4A] to-[#FF896B] hover:brightness-110 active:scale-95 text-[#07080D] px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#FF6B4A]/30 transition-all text-sm"
            >
              Build your AI bot
              <ArrowRight size={17} />
            </button>

            {user && (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors text-sm text-center"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          COMPREHENSIVE SAAS FOOTER
      ========================================================= */}
      <footer className="border-t border-white/[0.08] bg-[#070912] py-12 text-xs text-[#6F7588]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                <Bot size={18} className="text-[#5EEAD4]" />
                <span>AI Bot Builder</span>
              </div>
              <p className="leading-relaxed text-[#7C8296] text-xs">
                Turn any website into a high-accuracy, sub-second streaming
                conversational AI assistant.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>

            <div>
              <p className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
                Product
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Live Sandbox
                  </a>
                </li>
                <li>
                  <a href="#embed-code" className="hover:text-white transition-colors">
                    Integration Script
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
                Stack & Models
              </p>
              <ul className="space-y-2">
                <li className="text-[#949AA8]">Groq LPU (Llama 3.3 70B)</li>
                <li className="text-[#949AA8]">Gemini Embedding 004</li>
                <li className="text-[#949AA8]">Supabase pgvector</li>
                <li className="text-[#949AA8]">Next.js 16 App Router</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
                Account
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-white transition-colors">
                    Create New Bot
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
            <p>© {new Date().getFullYear()} AI Bot Builder. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[#8B91A4]">
              <span>Built with Next.js, Groq & Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
