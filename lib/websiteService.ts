import { supabase } from "./supabase";

export async function getWebsite(url: string) {
  const { data } = await supabase
    .from("websites")
    .select("*")
    .eq("website_url", url)
    .single();

  return data;
}

export async function saveWebsite(data: {
  website_url: string;
  industry: string;
  business_type: string;
  bot_name: string;
  website_content: string;
  analysis_json: any;
  products: string[];
}) {
  const { data: website, error } = await supabase
    .from("websites")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return website;
}