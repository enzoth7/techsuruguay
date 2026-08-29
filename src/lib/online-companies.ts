import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeCompanies, type TechUruguayCompany } from "@/src/lib/techsuruguay";

const CONTENT_KEY = "companies";

export async function getOnlineCompanies(client: SupabaseClient) {
  const { data, error } = await client
    .from("site_content")
    .select("content")
    .eq("key", CONTENT_KEY)
    .maybeSingle();

  if (error) throw error;

  return data ? normalizeCompanies(data.content) : null;
}

export async function saveOnlineCompanies(client: SupabaseClient, companies: TechUruguayCompany[]) {
  const { error } = await client
    .from("site_content")
    .update({ content: companies })
    .eq("key", CONTENT_KEY)
    .select("key")
    .single();

  if (error) throw error;
}

export async function isCurrentUserAdmin(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}
