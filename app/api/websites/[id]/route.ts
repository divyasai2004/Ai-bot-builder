import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    website: data,
  });
}