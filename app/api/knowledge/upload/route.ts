import { NextResponse } from "next/server";
import mammoth from "mammoth";

import { chunkText } from "../../../../lib/chunkText";
import { saveChunks } from "../../../../lib/vectorStore";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const websiteId = formData.get("websiteId") as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file uploaded",
      });
    }

    if (!websiteId) {
      return NextResponse.json({
        success: false,
        error: "Missing websiteId",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    // ==========================
    // PDF (Temporarily Disabled)
    // ==========================
    if (file.type === "application/pdf") {
      return NextResponse.json({
        success: false,
        error:
          "PDF upload is temporarily disabled. Please upload TXT or DOCX files.",
      });
    }

    // ==========================
    // DOCX
    // ==========================
    else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer,
      });

      text = result.value;
    }

    // ==========================
    // TXT
    // ==========================
    else {
      text = buffer.toString("utf8");
    }

    // Clean text
    text = text.replace(/\s+/g, " ").trim();

    if (!text) {
      return NextResponse.json({
        success: false,
        error: "No text found in file.",
      });
    }

    // Create chunks
    const chunks = chunkText(text);

    // Save chunks to database
    await saveChunks(
  websiteId,
  chunks,
  file.name
);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      chunks: chunks.length,
    });
  } catch (err) {
    console.error("Knowledge Upload Error:", err);

    return NextResponse.json({
      success: false,
      error: "Upload failed",
    });
  }
}