import "server-only";

import { createEmbedding } from "./ai/embedding";
import { supabaseAdmin } from "./supabaseAdmin";

export async function searchRelevantChunks(
  question: string,
  websiteId: string
) {
  try {
    console.log("==========================================");
    console.log("RAG SEARCH");
    console.log("QUESTION:", question);
    console.log("WEBSITE ID:", websiteId);

    const embedding = await createEmbedding(
      question.slice(0, 500)
    );

    console.log(
      "QUESTION EMBEDDING LENGTH:",
      embedding.length
    );

    const { data, error } =
      await supabaseAdmin.rpc("match_chunks", {
        query_embedding: embedding,
        match_website: websiteId,
        match_count: 5,
      });

    if (error) {
      console.error("RAG RPC ERROR:", error);
      return [];
    }

    console.log(
      "RETRIEVED CHUNKS:",
      data?.length || 0
    );

    if (data && data.length > 0) {
      console.log(
        "========== RETRIEVED CONTENT =========="
      );

      data.forEach(
        (
          chunk: {
            id?: string;
            chunk_index?: number;
            chunk_text?: string;
            similarity?: number;
          },
          index: number
        ) => {
          console.log(`\n--- CHUNK ${index + 1} ---`);

          console.log(
            "ID:",
            chunk.id
          );

          console.log(
            "INDEX:",
            chunk.chunk_index
          );

          console.log(
            "SIMILARITY:",
            chunk.similarity
          );

          console.log(
            "TEXT:",
            String(
              chunk.chunk_text || ""
            ).slice(0, 2000)
          );
        }
      );
    }

    console.log(
      "=========================================="
    );

    return data || [];
  } catch (error) {
    console.error("RAG ERROR:", error);
    return [];
  }
}