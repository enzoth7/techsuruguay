import { createClient } from "@supabase/supabase-js";
import { getOnlineCompanies } from "@/src/lib/online-companies";
import { cloneCompanies, mergeCompanies, TECHSURUGUAY_COMPANIES } from "@/src/lib/techsuruguay";

export async function getPublishedCompanies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return cloneCompanies(TECHSURUGUAY_COMPANIES);
  }

  try {
    const client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const companies = await getOnlineCompanies(client);

    return companies?.length
      ? mergeCompanies(TECHSURUGUAY_COMPANIES, companies)
      : cloneCompanies(TECHSURUGUAY_COMPANIES);
  } catch {
    return cloneCompanies(TECHSURUGUAY_COMPANIES);
  }
}
