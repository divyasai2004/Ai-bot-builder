import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get all chats for this website
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("website_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  const totalMessages = data.length;

  const uniqueVisitors = new Set(
    data.map((chat) => chat.visitor_id)
  ).size;

  const totalConversations = uniqueVisitors;

  return NextResponse.json({
    success: true,

    analytics: {
      totalVisitors: uniqueVisitors,
      totalMessages,
      totalConversations,
      recentChats: data.slice(0, 10),
    },
  });
}