import { supabaseAdmin } from "./supabaseAdmin";import { generateEmbedding } from "./embedding";

export async function saveChunks(
  websiteId: string,
  chunks: string[],
  fileName: string
) {
  // Delete previous chunks of the same file
  await supabaseAdmin
    .from("website_chunks")
    .delete()
    .eq("website_id", websiteId)
    .eq("file_name", fileName);

  for (let i = 0; i < chunks.length; i++) {
    try {
      console.log(`Generating embedding for chunk ${i + 1}`);

      const embedding = await generateEmbedding(chunks[i]);

      if (!embedding || embedding.length === 0) {
        console.log(
          `Skipping chunk ${i + 1}: embedding generation failed`
        );
        continue;
      }

      const { error } = await supabaseAdmin
        .from("website_chunks")
        .insert({
          website_id: websiteId,
          file_name: fileName,
          uploaded_at: new Date().toISOString(),
          chunk_index: i,
          chunk_text: chunks[i],
          embedding,
        });

      if (error) {
        console.error(
          `Supabase insert failed for chunk ${i + 1}`,
          error
        );
      } else {
        console.log(`Chunk ${i + 1} saved`);
      }
    } catch (err) {
      console.error(
        `Error while saving chunk ${i + 1}`,
        err
      );
    }
  }
}