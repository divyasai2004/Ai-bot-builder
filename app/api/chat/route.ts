import { NextResponse } from "next/server";
import ollama from "ollama";
import { searchRelevantChunks } from "../../../lib/rag";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("========== CHAT REQUEST ==========");
    console.log("QUESTION:", body.question);

    console.log("WEBSITE ID:");
    console.log(body.websiteId);

    // Search RAG
    const chunks = await searchRelevantChunks(
      body.question,
      body.websiteId
    );

    console.log("Retrieved Chunks:");
    console.log(chunks.length);

    if (chunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "Sorry, I couldn't find that information on this website.",
      });
    }

    const context = chunks
      .map(
        (chunk: any, index: number) => `
Context ${index + 1}

${chunk.chunk_text}
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

const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of response) {
      controller.enqueue(
        encoder.encode(chunk.message?.content || "")
      );
    }

    controller.close();
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      answer: "Sorry, something went wrong.",
    });
  }
}