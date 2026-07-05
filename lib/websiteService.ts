import { supabaseAdmin } from "./supabaseAdmin";

export async function getWebsite(
  url: string,
  userId: string
) {
  const { data } = await supabaseAdmin
    .from("websites")
    .select("*")
    .eq("website_url", url)
    .eq("user_id", userId)
    .single();

  return data;
}

export async function saveWebsite(data: {
  user_id: string;

  website_url: string;
  industry: string;
  business_type: string;

  bot_name: string;
  welcome_message: string;
  theme: string;
  suggested_questions: string[];

  website_content: string;
  analysis_json: any;
  products: string[];
}) {
  const { data: website, error } =
    await supabaseAdmin
      .from("websites")
      .insert(data)
      .select()
      .single();

  if (error) throw error;

  return website;
}