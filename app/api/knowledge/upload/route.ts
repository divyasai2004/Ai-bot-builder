import { NextResponse } from "next/server";
import mammoth from "mammoth";

import { chunkText } from "../../../../lib/chunkText";
import { saveChunks } from "../../../../lib/vectorStore";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(req: Request) {
  try {
    // ==========================================
    // 1. AUTHENTICATE USER
    // ==========================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // 2. READ FORM DATA
    // ==========================================

    const formData = await req.formData();

    const fileValue = formData.get("file");
    const websiteIdValue =
      formData.get("websiteId");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    const file = fileValue;

    const websiteId =
      typeof websiteIdValue === "string"
        ? websiteIdValue.trim()
        : "";

    if (!websiteId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing website ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 3. VERIFY BOT OWNERSHIP
    // ==========================================

    const { data: website, error: websiteError } =
      await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", websiteId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (websiteError) {
      console.error(
        "KNOWLEDGE OWNERSHIP CHECK ERROR:",
        websiteError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify bot ownership.",
        },
        {
          status: 500,
        }
      );
    }

    if (!website) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bot not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // 4. VALIDATE FILE SIZE
    // ==========================================

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File is too large. Maximum size is 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 5. VALIDATE FILE TYPE
    // ==========================================

    const lowerName =
      file.name.toLowerCase();

    const isTxt =
      file.type === "text/plain" ||
      lowerName.endsWith(".txt");

    const isDocx =
      file.type === DOCX_TYPE ||
      lowerName.endsWith(".docx");

    const isPdf =
      file.type === "application/pdf" ||
      lowerName.endsWith(".pdf");

    if (isPdf) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF upload is temporarily disabled. Please upload TXT or DOCX files.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isTxt && !isDocx) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported file type. Please upload a TXT or DOCX file.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 6. EXTRACT TEXT
    // ==========================================

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    let text = "";

    if (isDocx) {
      const result =
        await mammoth.extractRawText({
          buffer,
        });

      text = result.value;
    } else {
      text =
        buffer.toString("utf8");
    }

    // ==========================================
    // 7. CLEAN TEXT
    // ==========================================

    text = text
      .replace(/\u0000/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No readable text was found in this file.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 8. CREATE CHUNKS
    // ==========================================

    const chunks =
      chunkText(text);

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No knowledge chunks could be created.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "=========================================="
    );

    console.log("KNOWLEDGE UPLOAD");
    console.log("WEBSITE ID:", websiteId);
    console.log("FILE:", file.name);
    console.log("CHUNKS:", chunks.length);

    console.log(
      "=========================================="
    );

    // ==========================================
    // 9. SAVE CHUNKS
    // ==========================================

    const result =
      await saveChunks(
        websiteId,
        chunks,
        file.name
      );

    // ==========================================
    // 10. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      fileName:
        file.name,

      chunks:
        result.savedChunks,

      message:
        "Knowledge document uploaded successfully.",
    });
  } catch (error: any) {
    console.error(
      "KNOWLEDGE UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}




















// import { NextResponse } from "next/server";
// import mammoth from "mammoth";

// import { chunkText } from "../../../../lib/chunkText";
// import { saveChunks } from "../../../../lib/vectorStore";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File;
//     const websiteId = formData.get("websiteId") as string;

//     if (!file) {
//       return NextResponse.json({
//         success: false,
//         error: "No file uploaded",
//       });
//     }

//     if (!websiteId) {
//       return NextResponse.json({
//         success: false,
//         error: "Missing websiteId",
//       });
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     let text = "";

//     // ==========================
//     // PDF (Temporarily Disabled)
//     // ==========================
//     if (file.type === "application/pdf") {
//       return NextResponse.json({
//         success: false,
//         error:
//           "PDF upload is temporarily disabled. Please upload TXT or DOCX files.",
//       });
//     }

//     // ==========================
//     // DOCX
//     // ==========================
//     else if (
//       file.type ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {
//       const result = await mammoth.extractRawText({
//         buffer,
//       });

//       text = result.value;
//     }

//     // ==========================
//     // TXT
//     // ==========================
//     else {
//       text = buffer.toString("utf8");
//     }

//     // Clean text
//     text = text.replace(/\s+/g, " ").trim();

//     if (!text) {
//       return NextResponse.json({
//         success: false,
//         error: "No text found in file.",
//       });
//     }

//     // Create chunks
//     const chunks = chunkText(text);

//     // Save chunks to database
//     await saveChunks(
//   websiteId,
//   chunks,
//   file.name
// );

//     return NextResponse.json({
//       success: true,
//       fileName: file.name,
//       chunks: chunks.length,
//     });
//   } catch (err) {
//     console.error("Knowledge Upload Error:", err);

//     return NextResponse.json({
//       success: false,
//       error: "Upload failed",
//     });
//   }
// }