import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file provided.",
        },
        { status: 400 }
      );
    }

    // 1. Validate file type
    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a valid image (PNG, JPG, WebP, SVG, GIF).",
        },
        { status: 400 }
      );
    }

    // 2. Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image is too large. Maximum allowed size is 5 MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Sanitize filename to prevent special character or URL breakage (#, spaces, unicode)
    const rawExt = file.name.split(".").pop() || "png";
    const extension = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40) || "bot-logo";

    const fileName = `${Date.now()}-${baseName}.${extension}`;

    // 4. Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("LOGO UPLOAD ERROR:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: uploadError.message || "Failed to upload image to storage.",
        },
        { status: 500 }
      );
    }

    // 5. Retrieve public URL
    const { data } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });
  } catch (err) {
    console.error("UPLOAD LOGO HANDLER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Upload failed.",
      },
      { status: 500 }
    );
  }
}
