import { NextResponse } from "next/server";
//import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file uploaded",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName =
      `${Date.now()}-${file.name}`;

    const { error } = await supabaseAdmin.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    const { data } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Upload failed",
    });
  }
}