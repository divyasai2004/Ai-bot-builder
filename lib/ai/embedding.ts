import "server-only";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY environment variable."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL = "gemini-embedding-2";

const DIMENSIONS = 768;

export async function createEmbedding(
  text: string
): Promise<number[]> {
  const cleanText = text
    .trim()
    .slice(0, 4000);

  if (!cleanText) {
    throw new Error(
      "Cannot generate embedding for empty text."
    );
  }

  try {
    const response =
      await ai.models.embedContent({
        model: MODEL,
        contents: cleanText,
        config: {
          outputDimensionality: DIMENSIONS,
        },
      });

    const embedding =
      response.embeddings?.[0]?.values;

    if (
      !embedding ||
      embedding.length !== DIMENSIONS
    ) {
      throw new Error(
        `Invalid embedding returned. Expected ${DIMENSIONS} dimensions, received ${
          embedding?.length || 0
        }.`
      );
    }

    return embedding;
  } catch (error) {
    console.error(
      "Gemini embedding error:",
      error
    );

    throw new Error(
      "Failed to generate embedding."
    );
  }
}