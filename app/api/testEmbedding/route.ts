import { NextResponse } from "next/server";
import { generateEmbedding } from "../../../lib/embedding";

export async function GET() {
  const embedding = await generateEmbedding(
    "Apple iPhone 17 Pro"
  );

  return NextResponse.json({
    length: embedding.length,
    sample: embedding.slice(0, 10),
  });
}