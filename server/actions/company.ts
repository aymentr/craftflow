"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/validators/company";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function upsertCompany(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/settings/company");
    return;
  }

  const input = companySchema.parse({
    name: formValue(formData, "name"),
    owner_name: formValue(formData, "owner_name"),
    street: formValue(formData, "street"),
    postal_code: formValue(formData, "postal_code"),
    city: formValue(formData, "city"),
    country: formValue(formData, "country") || "Deutschland",
    tax_number: formValue(formData, "tax_number"),
    vat_id: formValue(formData, "vat_id") || undefined,
    default_vat_rate: formValue(formData, "default_vat_rate"),
    iban: formValue(formData, "iban"),
    payment_terms_days: formValue(formData, "payment_terms_days"),
    logo_url: formValue(formData, "logo_url"),
  });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const existing = await getCurrentCompany();
  if (existing) {
    const { error } = await supabase.from("companies").update(input).eq("id", existing.id);
    if (error) {
      throw new Error(`Company profile could not be updated: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("companies").insert({ ...input, owner_user_id: auth.user.id });
    if (error) {
      throw new Error(`Company profile could not be saved: ${error.message}`);
    }
  }

  revalidatePath("/settings/company");
  revalidatePath("/dashboard");
  redirect("/settings/company?saved=1");
}
