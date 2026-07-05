import ollama from "ollama";
import { supabase } from "./supabase";

export async function searchRelevantChunks(
  question: string,
  websiteId: string
) {
  try {
    console.log("Generating question embedding...");

    const embedding = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: question.slice(0, 500),
    });

    const { data, error } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: embedding.embedding,
        match_website: websiteId,
        match_count: 2, // Reduced from 3
      }
    );

    if (error) {
      console.error(error);
      return [];
    }

    console.log(
      `Retrieved ${data?.length || 0} relevant chunks`
    );

    return data || [];
  } catch (err) {
    console.error("RAG Error:", err);
    return [];
  }
}