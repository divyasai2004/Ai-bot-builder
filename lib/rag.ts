import ollama from "ollama";
import { supabase } from "./supabase";

export async function searchRelevantChunks(
  question: string,
  websiteId: string
) {
  // Generate embedding for user's question
  const embedding = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: question,
  });

  const { data, error } = await supabase.rpc(
    "match_chunks",
    {
      query_embedding: embedding.embedding,
      match_website: websiteId,
      match_count: 3,
    }
  );

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}