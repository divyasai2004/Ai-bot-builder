import "server-only";

import ollama from "ollama";

export interface AIChatOptions {
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

export async function generateChatResponse({
  prompt,
  temperature = 0.2,
  jsonMode = false,
}: AIChatOptions) {
  const response = await ollama.chat({
    model:
      process.env.OLLAMA_CHAT_MODEL ||
      "qwen2.5:1.5b",

    stream: false,

    ...(jsonMode
      ? { format: "json" as const }
      : {}),

    options: {
      temperature,
    },

    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    response.message?.content?.trim();

  if (!text) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  return text;
}

export async function generateChatStream({
  prompt,
  temperature = 0.2,
}: AIChatOptions) {
  return ollama.chat({
    model:
      process.env.OLLAMA_CHAT_MODEL ||
      "qwen2.5:1.5b",

    stream: true,

    options: {
      temperature,
    },

    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
}