"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customerSchema } from "@/lib/validators/customer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function createCustomer(formData: FormData) {
  const input = customerSchema.parse({
    name: formValue(formData, "name"),
    business_name: formValue(formData, "business_name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    street: formValue(formData, "street"),
    postal_code: formValue(formData, "postal_code"),
    city: formValue(formData, "city"),
    country: formValue(formData, "country") || "Deutschland",
    notes: formValue(formData, "notes"),
  });

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (!company) {
      redirect("/settings/company?error=company-required");
    }

    const { error } = await supabase.from("customers").insert({ ...input, company_id: company.id });
    if (error) {
      throw new Error(`Customer could not be saved: ${error.message}`);
    }
  }

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer() {
  revalidatePath("/customers");
}

export async function updateCustomerById(customerId: string, formData: FormData) {
  const input = customerSchema.parse({
    name: formValue(formData, "name"),
    business_name: formValue(formData, "business_name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    street: formValue(formData, "street"),
    postal_code: formValue(formData, "postal_code"),
    city: formValue(formData, "city"),
    country: formValue(formData, "country") || "Deutschland",
    notes: formValue(formData, "notes"),
  });

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      const { error } = await supabase.from("customers").update(input).eq("id", customerId).eq("company_id", company.id);
      if (error) {
        throw new Error(`Customer could not be updated: ${error.message}`);
      }
    }
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function deleteCustomer() {
  revalidatePath("/customers");
}

export async function deleteCustomerById(customerId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      await supabase.from("customers").delete().eq("id", customerId).eq("company_id", company.id);
    }
  }

  revalidatePath("/customers");
  redirect("/customers");
}
