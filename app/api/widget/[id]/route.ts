import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("websites")
      .select(`
        id,
        website_url,
        industry,
        business_type,
        bot_name,
        welcome_message,
        theme,
        suggested_questions,
        primary_color,
        header_color,
        widget_position,
        widget_width,
        border_radius,
        logo_url,
        is_active
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("WIDGET CONFIG ERROR:", error);

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Bot not found.",
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const url = new URL(req.url);
    const isPreview = url.searchParams.get("preview") === "true";

    if (isPreview) {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Unauthorized preview request." }),
          { status: 401, headers: corsHeaders }
        );
      }

      const { data: ownedBot } = await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!ownedBot) {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Bot not found or access denied." }),
          { status: 404, headers: corsHeaders }
        );
      }
    }

    if (!data.is_active && !isPreview) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "This bot is currently paused.",
          paused: true,
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        config: data,
        paused: !data.is_active,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("WIDGET ROUTE ERROR:", error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to load widget configuration.",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
