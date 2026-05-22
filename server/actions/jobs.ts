"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { jobSchema } from "@/lib/validators/job";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function assertSupabaseSuccess(error: { message: string } | null, message: string) {
  if (error) {
    throw new Error(`${message}: ${error.message}`);
  }
}

function uploadedPhotos(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "photo";

  return `${baseName}.${extension}`;
}

async function uploadJobPhotos({
  companyId,
  jobId,
  formData,
}: {
  companyId: string;
  jobId: string;
  formData: FormData;
}) {
  const photos = uploadedPhotos(formData);
  if (photos.length === 0) return;

  const supabase = await createClient();

  for (const [index, photo] of photos.entries()) {
    const storagePath = `${companyId}/${jobId}/${Date.now()}-${index}-${safeFileName(photo.name)}`;
    const { error: uploadError } = await supabase.storage.from("job-photos").upload(storagePath, photo, {
      contentType: photo.type || "image/jpeg",
      upsert: false,
    });
    assertSupabaseSuccess(uploadError, "Job photo could not be uploaded");

    const { error: insertError } = await supabase.from("job_photos").insert({
      company_id: companyId,
      job_id: jobId,
      file_url: storagePath,
      storage_bucket: "job-photos",
      storage_path: storagePath,
    });
    assertSupabaseSuccess(insertError, "Job photo record could not be saved");
  }
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
    if (!company) {
      redirect("/settings/company?error=company-required");
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        ...input,
        company_id: company.id,
        completed_at: input.status === "completed" || input.status === "invoiced" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    assertSupabaseSuccess(error, "Job could not be saved");
    if (!job) {
      throw new Error("Job could not be saved.");
    }

    await uploadJobPhotos({ companyId: company.id, jobId: job.id, formData });
  }

  revalidatePath("/jobs");
  redirect("/jobs?saved=1");
}

export async function completeJob(jobId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (!company) {
      redirect("/settings/company?error=company-required");
    }

    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("company_id", company.id);
    assertSupabaseSuccess(error, "Job could not be completed");
  }
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  redirect("/jobs?completed=1");
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
    if (!company) {
      redirect("/settings/company?error=company-required");
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        ...input,
        completed_at: input.status === "completed" || input.status === "invoiced" ? new Date().toISOString() : null,
      })
      .eq("id", jobId)
      .eq("company_id", company.id);
    assertSupabaseSuccess(error, "Job could not be updated");
    await uploadJobPhotos({ companyId: company.id, jobId, formData });
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  redirect("/jobs?updated=1");
}

export async function deleteJobById(jobId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    if (company) {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("company_id", company.id);
      assertSupabaseSuccess(error, "Job could not be deleted");
    }
  }

  revalidatePath("/jobs");
  redirect("/jobs?deleted=1");
}

export async function uploadJobPhoto() {
  revalidatePath("/jobs");
}
