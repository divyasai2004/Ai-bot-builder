import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// --------------------
// GET WEBSITE
// --------------------
export async function GET(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

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
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("websites")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: "Website not found or access denied.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    website: data,
  });
}

// --------------------
// UPDATE BOT SETTINGS
// --------------------
export async function PUT(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

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
      { status: 401 }
    );
  }

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("websites")
    .update({
      bot_name: body.bot_name,
      welcome_message: body.welcome_message,
      theme: body.theme,
      suggested_questions: body.suggested_questions,

      primary_color: body.primary_color,
      header_color: body.header_color,
      widget_position: body.widget_position,
      widget_width: body.widget_width,
      border_radius: body.border_radius,
      logo_url: body.logo_url,
      is_active: body.is_active,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        success: false,
        error: "Website not found or access denied.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Bot updated successfully.",
  });
}

// --------------------
// DELETE BOT
// --------------------
export async function DELETE(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

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
      { status: 401 }
    );
  }

  // First verify ownership
  const { data: website } = await supabaseAdmin
    .from("websites")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!website) {
    return NextResponse.json(
      {
        success: false,
        error: "Website not found or access denied.",
      },
      { status: 404 }
    );
  }

  // Delete knowledge chunks only after ownership check
  const { error: chunksError } =
    await supabaseAdmin
      .from("website_chunks")
      .delete()
      .eq("website_id", id);

  if (chunksError) {
    return NextResponse.json(
      {
        success: false,
        error: chunksError.message,
      },
      { status: 500 }
    );
  }

  // Delete website
  const { error } = await supabaseAdmin
    .from("websites")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}