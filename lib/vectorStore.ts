import { supabase } from "./supabase";
import { generateEmbedding } from "./embedding";

export async function saveChunks(
  websiteId: string,
  chunks: string[]
) {
  // Delete old chunks (if website is re-analyzed)
  await supabase
    .from("website_chunks")
    .delete()
    .eq("website_id", websiteId);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);

    const { error } = await supabase
      .from("website_chunks")
      .insert({
        website_id: websiteId,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding,
      });

    if (error) {
      console.log(error);
    }
  }
}