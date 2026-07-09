import { supabaseAdmin } from "./supabaseAdmin";

export async function saveChat(data: {
  website_id: string;
  visitor_id: string;
  question: string;
  answer: string;
}) {
  const { error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      website_id: data.website_id,
      visitor_id: data.visitor_id,
      question: data.question,
      answer: data.answer,
    });

  if (error) {
    console.error(
      "CHAT SAVE ERROR:",
      error
    );

    throw new Error(
      "Failed to save chat message."
    );
  }
}