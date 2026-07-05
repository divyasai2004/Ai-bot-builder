import ollama from "ollama";

export async function generateEmbedding(text: string) {
  try {
    const response = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text.slice(0,4000),
    });

    return response.embedding;
  } catch (error) {
    console.error("Embedding Error:", error);

    return [];
  }
}