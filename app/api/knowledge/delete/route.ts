import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { websiteId, fileName } = body;

    if (!websiteId || !fileName) {
      return NextResponse.json({
        success: false,
        error: "Missing data",
      });
    }

    // Protect website crawl
    if (fileName === "__website__") {
      return NextResponse.json({
        success: false,
        error: "Website crawl cannot be deleted.",
      });
    }

    const { error } = await supabase
      .from("website_chunks")
      .delete()
      .eq("website_id", websiteId)
      .eq("file_name", fileName);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Delete failed",
    });
  }
}