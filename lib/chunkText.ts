export function chunkText(
  text: string,
  chunkSize = 800
) {
  const chunks: string[] = [];

  // Split into paragraphs first
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds chunk size,
    // save current chunk first.
    if (
      currentChunk.length + paragraph.length >
      chunkSize
    ) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      currentChunk = paragraph;
    } else {
      currentChunk += "\n\n" + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}