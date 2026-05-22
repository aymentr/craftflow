import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  requireSupabaseAdminEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(url!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
