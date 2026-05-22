const requiredSupabaseEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function missingEnv(keys: readonly string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function hasSupabaseEnv() {
  const missing = missingEnv(requiredSupabaseEnv);

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(`Missing required production Supabase environment variables: ${missing.join(", ")}`);
  }

  return missing.length === 0;
}

export function requireSupabaseAdminEnv() {
  const missing = missingEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  if (missing.length > 0) {
    throw new Error(`Missing required Supabase admin environment variables: ${missing.join(", ")}`);
  }
}

export function requireCronSecret() {
  if (!process.env.CRON_SECRET) {
    throw new Error("Missing required CRON_SECRET environment variable.");
  }
}

export function hasInvoiceEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.INVOICE_FROM_EMAIL);
}
