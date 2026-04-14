import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return supabaseAdminClient;
}
