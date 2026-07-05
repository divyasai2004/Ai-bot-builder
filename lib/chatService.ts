import { supabase } from "./supabase";

export async function saveChat(data: {
  website_id: string;
  visitor_id: string;
  question: string;
  answer: string;
}) {
  const { error } = await supabase
    .from("chat_messages")
    .insert(data);

  if (error) {
    console.error("Chat Save Error:", error);
  }
}