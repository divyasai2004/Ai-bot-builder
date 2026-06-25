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

    // Search the most relevant chunks
    const chunks = await searchRelevantChunks(
      body.question,
      body.websiteId
    );

    console.log("Retrieved Chunks:");
    console.log(chunks.length);
    if (chunks.length === 0) {
  return NextResponse.json({
    success: true,
    answer: "Sorry, I couldn't find that information on this website.",
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

   const prompt = `
You are the official AI assistant for this website.

Below is information retrieved from the website.

-------------------------
${context}
-------------------------

Question:
${body.question}

Instructions:
- Answer ONLY using the information above.
- If the context contains product names, list them.
- Be concise.
- Do NOT invent facts.
- If the answer is truly missing, reply:
Sorry, I couldn't find that information on this website.

Answer:
`;
console.log("========== FINAL PROMPT ==========");
console.log(prompt);
    const response = await ollama.chat({
      
      model: "qwen2.5:1.5b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    console.log("========== FINAL PROMPT ==========");
    console.log(prompt);

    return NextResponse.json({
      success: true,
      answer: response.message.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      answer: "Sorry, something went wrong.",
    });
  }
}