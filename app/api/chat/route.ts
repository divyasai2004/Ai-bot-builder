import { NextResponse } from "next/server";
import ollama from "ollama";
import { searchRelevantChunks } from "../../../lib/rag";
import { saveChat } from "../../../lib/chatService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

console.log("========== CHAT REQUEST ==========");
console.log("QUESTION:", body.question);
console.log("WEBSITE ID:", body.websiteId);

// Validate request
if (!body.websiteId || !body.question?.trim()) {
  return NextResponse.json(
    {
      success: false,
      error: "Website ID and question are required.",
    },
    {
      status: 400,
      headers: corsHeaders,
    }
  );
}

// Check whether bot exists and is active
const { data: bot, error: botError } =
  await supabaseAdmin
    .from("websites")
    .select("id, is_active")
    .eq("id", body.websiteId)
    .single();

if (botError || !bot) {
  return NextResponse.json(
    {
      success: false,
      error: "Bot not found.",
    },
    {
      status: 404,
      headers: corsHeaders,
    }
  );
}

if (!bot.is_active) {
  console.log("CHAT BLOCKED: BOT IS PAUSED");

  return NextResponse.json(
    {
      success: false,
      error: "This bot is currently paused.",
      paused: true,
    },
    {
      status: 403,
      headers: corsHeaders,
    }
  );
}

// Search RAG only after bot status check
const chunks = await searchRelevantChunks(
  body.question,
  body.websiteId
);

    console.log("Retrieved Chunks:");
    console.log(chunks.length);

    if (chunks.length === 0) {
  return new Response(
    "Sorry, I couldn't find that information on this website.",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders,
      },
    }
  );
}

    const context = chunks
  .slice(0, 2)
  .map(
    (chunk: any, index: number) => `
Context ${index + 1}

${chunk.chunk_text.slice(0, 900)}
`
  )
  .join("\n------------------------\n");
    console.log("========== RAG CONTEXT ==========");
    console.log(context);

    // Keep only last 6 conversation messages
    const history = (body.history || []).slice(-6);

    const conversation = history
      .map(
        (msg: any) =>
          `${msg.role.toUpperCase()}: ${msg.content}`
      )
      .join("\n");

    const prompt = `
You are the official AI assistant for this website.

Use BOTH:

1. Website Context
2. Conversation History

Never invent information.

-----------------------
WEBSITE CONTEXT
-----------------------

${context}

-----------------------
CONVERSATION
-----------------------

${conversation}

-----------------------

Current Question:

${body.question}

Instructions:

- Answer ONLY using website information.
- Use conversation history to understand follow-up questions.
- Never make up products.
- If the answer is missing, reply:

Sorry, I couldn't find that information on this website.

Answer:
`;

    console.log("========== FINAL PROMPT ==========");
    console.log(prompt);

    const response = await ollama.chat({
  model: "qwen2.5:1.5b",
  stream: true,
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

const encoder = new TextEncoder();

let fullAnswer = "";

const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of response) {
      const text = chunk.message?.content || "";

      fullAnswer += text;

      controller.enqueue(
        encoder.encode(text)
      );
    }

    await saveChat({
      website_id: body.websiteId,
      visitor_id: body.visitorId || "anonymous",
      question: body.question,
      answer: fullAnswer,
    });

    controller.close();
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",

    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
});


  } catch (error) {
    console.error(error);

    return NextResponse.json(
  {
    success: false,
    answer: "Sorry, something went wrong.",
  },
  {
    headers: corsHeaders,
  }
);
  }
}