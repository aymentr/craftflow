"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { jobSchema } from "@/lib/validators/job";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function createJob(formData: FormData) {
  const input = jobSchema.parse({
    customer_id: formValue(formData, "customer_id"),
    title: formValue(formData, "title"),
    description: formValue(formData, "description"),
    location: formValue(formData, "location"),
    labor_hours: formValue(formData, "labor_hours"),
    status: formValue(formData, "status") || "draft",
    internal_notes: formValue(formData, "internal_notes"),
  });

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      await supabase.from("jobs").insert({
        ...input,
        company_id: company.id,
        completed_at: input.status === "completed" || input.status === "invoiced" ? new Date().toISOString() : null,
      });
    }
  }

  revalidatePath("/jobs");
  redirect("/jobs");
}

export async function completeJob(jobId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.from("jobs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", jobId);
  }
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateJobById(jobId: string, formData: FormData) {
  const input = jobSchema.parse({
    customer_id: formValue(formData, "customer_id"),
    title: formValue(formData, "title"),
    description: formValue(formData, "description"),
    location: formValue(formData, "location"),
    labor_hours: formValue(formData, "labor_hours"),
    status: formValue(formData, "status") || "draft",
    internal_notes: formValue(formData, "internal_notes"),
  });

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      await supabase
        .from("jobs")
        .update({
          ...input,
          completed_at: input.status === "completed" || input.status === "invoiced" ? new Date().toISOString() : null,
        })
        .eq("id", jobId)
        .eq("company_id", company.id);
    }
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function deleteJobById(jobId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      await supabase.from("jobs").delete().eq("id", jobId).eq("company_id", company.id);
    }
  }

  revalidatePath("/jobs");
  redirect("/jobs");
}

export async function uploadJobPhoto() {
  revalidatePath("/jobs");
}
