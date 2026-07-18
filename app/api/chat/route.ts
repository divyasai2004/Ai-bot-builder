import { NextResponse } from "next/server";
import {
  generateChatStream,
} from "../../../lib/ai/chat";
import { searchRelevantChunks } from "../../../lib/rag";
import { saveChat } from "../../../lib/chatService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ==========================================================
// CORS
// ==========================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==========================================================
// BASIC DEVELOPMENT RATE LIMITER
//
// IMPORTANT:
// This is suitable for local development / single-server MVP.
//
// Later, for production deployment, replace this with
// Redis / Upstash / another shared rate-limit store.
// ==========================================================

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  aiChatRateLimit?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalForRateLimit.aiChatRateLimit ??
  new Map<string, RateLimitEntry>();

globalForRateLimit.aiChatRateLimit =
  rateLimitStore;

// ==========================================================
// TYPES
// ==========================================================

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  websiteId?: unknown;
  question?: unknown;
  visitorId?: unknown;
  conversationId?: unknown;
  history?: unknown;
}

// ==========================================================
// HELPERS
// ==========================================================

function getClientIdentifier(
  req: Request,
  websiteId: string,
  visitorId: string
) {
  const forwardedFor =
    req.headers.get("x-forwarded-for");

  const ip =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown-ip";

  return `${websiteId}:${visitorId}:${ip}`;
}

function isRateLimited(key: string) {
  const now = Date.now();

  const current =
    rateLimitStore.get(key);

  if (
    !current ||
    now >= current.resetAt
  ) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt:
        now + RATE_LIMIT_WINDOW,
    });

    return false;
  }

  if (
    current.count >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return true;
  }

  current.count += 1;

  rateLimitStore.set(
    key,
    current
  );

  return false;
}

function cleanHistory(
  value: unknown
): HistoryMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        message
      ): message is HistoryMessage => {
        if (
          !message ||
          typeof message !== "object"
        ) {
          return false;
        }

        const candidate =
          message as Record<
            string,
            unknown
          >;

        const validRole =
          candidate.role === "user" ||
          candidate.role ===
            "assistant";

        const validContent =
          typeof candidate.content ===
            "string" &&
          candidate.content.trim()
            .length > 0;

        return (
          validRole &&
          validContent
        );
      }
    )
    .slice(-6)
    .map((message) => ({
      role: message.role,

      content:
        message.content
          .trim()
          .slice(0, 1500),
    }));
}

// ==========================================================
// OPTIONS
// ==========================================================

export async function OPTIONS() {
  return new NextResponse(
    null,
    {
      status: 204,
      headers: corsHeaders,
    }
  );
}

// ==========================================================
// POST CHAT
// ==========================================================

export async function POST(
  req: Request
) {
  try {
    // ======================================================
    // 1. PARSE BODY
    // ======================================================

    let body: ChatRequestBody;

    try {
      body =
        await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ======================================================
    // 2. NORMALIZE VALUES
    // ======================================================

    const websiteId =
      typeof body.websiteId ===
      "string"
        ? body.websiteId.trim()
        : "";

    const question =
      typeof body.question ===
      "string"
        ? body.question.trim()
        : "";

    const visitorId =
      typeof body.visitorId ===
        "string" &&
      body.visitorId.trim()
        ? body.visitorId
            .trim()
            .slice(0, 150)
        : "anonymous";

    const conversationId =
      typeof body.conversationId ===
        "string" &&
      body.conversationId.trim()
        ? body.conversationId
            .trim()
            .slice(0, 150)
        : visitorId;

    // ======================================================
    // 3. VALIDATE REQUEST
    // ======================================================

    if (
      !websiteId ||
      !question
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Website ID and question are required.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      websiteId.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid website ID.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      question.length > 1500
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Question is too long. Maximum length is 1500 characters.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ======================================================
    // 4. RATE LIMIT
    // ======================================================

    const rateLimitKey =
      getClientIdentifier(
        req,
        websiteId,
        visitorId
      );

    if (
      isRateLimited(
        rateLimitKey
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Too many messages. Please wait a moment and try again.",
        },
        {
          status: 429,

          headers: {
            ...corsHeaders,

            "Retry-After": "60",
          },
        }
      );
    }

    console.log(
      "========== CHAT REQUEST =========="
    );

    console.log(
      "QUESTION:",
      question
    );

    console.log(
      "WEBSITE ID:",
      websiteId
    );

    console.log(
      "VISITOR ID:",
      visitorId
    );

    console.log(
      "CONVERSATION ID:",
      conversationId
    );

    // ======================================================
    // 5. CHECK BOT
    // ======================================================

    const {
      data: bot,
      error: botError,
    } = await supabaseAdmin
      .from("websites")
      .select(
        "id, is_active"
      )
      .eq(
        "id",
        websiteId
      )
      .maybeSingle();

    if (
      botError ||
      !bot
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bot not found.",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // ======================================================
    // 6. CHECK ACTIVE STATUS
    // ======================================================

    if (!bot.is_active) {
      console.log(
        "CHAT BLOCKED: BOT IS PAUSED"
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "This bot is currently paused.",

          paused: true,
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // ======================================================
    // 7. SEARCH RAG
    // ======================================================

    const chunks =
      await searchRelevantChunks(
        question,
        websiteId
      );

    console.log(
      "RETRIEVED CHUNKS:",
      chunks.length
    );

    // ======================================================
    // 8. NO KNOWLEDGE FOUND
    // ======================================================

    if (
      chunks.length === 0
    ) {
      const fallbackAnswer =
        "Sorry, I couldn't find that information on this website.";

      await saveChat({
        website_id:
          websiteId,

        visitor_id:
          visitorId,

        conversation_id:
          conversationId,

        question,

        answer:
          fallbackAnswer,
      });

      return new Response(
        fallbackAnswer,
        {
          status: 200,

          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",

            ...corsHeaders,
          },
        }
      );
    }

    // ======================================================
    // 9. BUILD CONTEXT
    // ======================================================

    const context =
      chunks
        .slice(0, 2)
        .map(
          (
            chunk: any,
            index: number
          ) => `
Context ${index + 1}

${String(
  chunk.chunk_text || ""
).slice(0, 1200)}
`
        )
        .join(
          "\n------------------------\n"
        );

    // ======================================================
    // 10. CLEAN CONVERSATION HISTORY
    // ======================================================

    const history =
      cleanHistory(
        body.history
      );

    const conversation =
      history
        .map(
          (message) =>
            `${message.role.toUpperCase()}: ${message.content}`
        )
        .join("\n");

    // ======================================================
    // 11. BUILD PROMPT
    // ======================================================

    const prompt = `
You are the official AI assistant for this website.

Use only the supplied website context to answer factual questions about the business.

You may use the conversation history only to understand follow-up questions and references.

Do not invent:
- products
- prices
- services
- policies
- contact information
- availability
- business facts

-----------------------
WEBSITE CONTEXT
-----------------------

${context}

-----------------------
CONVERSATION HISTORY
-----------------------

${conversation || "No previous conversation."}

-----------------------
CURRENT QUESTION
-----------------------

${question}

Instructions:

- Answer clearly and concisely.
- Answer using only supported website context.
- Use conversation history only for continuity.
- If the website context does not contain enough information, reply exactly:

Sorry, I couldn't find that information on this website.

Answer:
`;

    // ======================================================
    // 12. OLLAMA STREAM
    // ======================================================

    const response =
  await generateChatStream({
    prompt,
    temperature: 0.2,
  });

    const encoder =
      new TextEncoder();

    let fullAnswer = "";

    // ======================================================
    // 13. RESPONSE STREAM
    // ======================================================

    const stream =
      new ReadableStream({
        async start(
          controller
        ) {
          try {
            for await (
              const chunk of response
            ) {
              const text =
                chunk.message
                  ?.content || "";

              fullAnswer += text;

              controller.enqueue(
                encoder.encode(
                  text
                )
              );
            }

            const finalAnswer =
              fullAnswer.trim() ||
              "Sorry, I couldn't generate a response.";

            await saveChat({
              website_id:
                websiteId,

              visitor_id:
                visitorId,

              conversation_id:
                conversationId,

              question,

              answer:
                finalAnswer,
            });

            controller.close();
          } catch (
            streamError
          ) {
            console.error(
              "CHAT STREAM ERROR:",
              streamError
            );

            controller.error(
              streamError
            );
          }
        },
      });

    // ======================================================
    // 14. RETURN STREAM
    // ======================================================

    return new Response(
      stream,
      {
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",

          "Cache-Control":
            "no-cache, no-store",

          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error(
      "CHAT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Sorry, something went wrong.",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}