import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("website_chunks")
    .select("file_name, uploaded_at")
    .eq("website_id", id);

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  const grouped: Record<
    string,
    {
      fileName: string;
      uploadedAt: string;
      chunks: number;
    }
  > = {};

  data.forEach((row: any) => {
    if (!grouped[row.file_name]) {
      grouped[row.file_name] = {
        fileName: row.file_name,
        uploadedAt: row.uploaded_at,
        chunks: 0,
      };
    }

    grouped[row.file_name].chunks++;
  });

  return NextResponse.json({
    success: true,
    files: Object.values(grouped),
  });
}