"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateInvoice, dueDateFromTerms } from "@/lib/invoice/calculate";
import { sendInvoiceEmail } from "@/lib/email/send-invoice";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";
import { generateInvoicePdfBuffer } from "@/lib/pdf/invoice-pdf";
import { createClient } from "@/lib/supabase/server";
import { toCents } from "@/lib/utils";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function generateAndStoreInvoicePdf(invoiceId: string) {
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!invoice) return null;

  const [{ data: company }, { data: customer }, { data: items }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", invoice.company_id).maybeSingle(),
    supabase.from("customers").select("*").eq("id", invoice.customer_id).maybeSingle(),
    supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id).order("sort_order"),
  ]);

  if (!company || !customer || !items?.length) return null;

  const pdfBuffer = await generateInvoicePdfBuffer({ company, customer, invoice, items });
  const storagePath = `${company.id}/${invoice.id}/${invoice.invoice_number ?? invoice.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("invoice-pdfs")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) return null;

  const { data: signed } = await supabase.storage.from("invoice-pdfs").createSignedUrl(storagePath, 60 * 60 * 24 * 30);
  const pdfUrl = signed?.signedUrl ?? storagePath;

  await supabase.from("invoices").update({ pdf_url: pdfUrl }).eq("id", invoiceId).eq("company_id", company.id);

  return {
    pdfUrl,
    pdfBuffer,
    filename: `Rechnung-${invoice.invoice_number ?? invoice.id}.pdf`,
  };
}

export async function generateInvoiceFromJob(jobId: string) {
  if (!hasSupabaseEnv()) {
    redirect("/invoices/77777777-7777-4777-8777-777777777777");
  }

  const supabase = await createClient();
  const company = await getCurrentCompany();
  const { data: job } = await supabase.from("jobs").select("*, customers(*)").eq("id", jobId).maybeSingle();

  if (!company || !job || job.company_id !== company.id) {
    redirect(`/jobs/${jobId}`);
  }

  const issueDate = new Date();
  const calculated = calculateInvoice([
    {
      description: job.description,
      quantity: Number(job.labor_hours || 1),
      unit: "Std.",
      unit_price: 6500,
      vat_rate: Number(company.default_vat_rate),
    },
  ]);

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      company_id: company.id,
      customer_id: job.customer_id,
      job_id: job.id,
      status: "draft",
      issue_date: issueDate.toISOString().slice(0, 10),
      due_date: dueDateFromTerms(issueDate, company.payment_terms_days),
      seller_snapshot: company,
      buyer_snapshot: job.customers ?? {},
      payment_terms_days: company.payment_terms_days,
      subtotal: calculated.subtotal,
      vat_total: calculated.vat_total,
      total: calculated.total,
    })
    .select("id")
    .single();

  if (invoice) {
    await supabase.from("invoice_items").insert(
      calculated.items.map((item, index) => ({
        company_id: company.id,
        invoice_id: invoice.id,
        sort_order: index + 1,
        ...item,
      })),
    );
    await supabase.from("jobs").update({ status: "invoiced" }).eq("id", job.id);
    redirect(`/invoices/${invoice.id}`);
  }

  redirect(`/jobs/${jobId}`);
}

export async function updateInvoice(formData: FormData) {
  const invoiceId = formValue(formData, "invoice_id");
  const issueDate = formValue(formData, "issue_date");
  const dueDate = formValue(formData, "due_date");
  const itemCount = Number(formValue(formData, "item_count") || 0);

  const rawItems = Array.from({ length: itemCount }, (_, index) => ({
    description: formValue(formData, `description_${index}`),
    quantity: Number(formValue(formData, `quantity_${index}`).replace(",", ".")),
    unit: formValue(formData, `unit_${index}`) || "Stk.",
    unit_price: toCents(formValue(formData, `unit_price_${index}`) || 0),
    vat_rate: Number(formValue(formData, `vat_rate_${index}`) || 0),
  })).filter((item) => item.description && item.quantity > 0 && item.unit_price >= 0);

  if (hasSupabaseEnv() && invoiceId) {
    const supabase = await createClient();
    const company = await getCurrentCompany();

    if (company && rawItems.length > 0) {
      const calculated = calculateInvoice(rawItems);
      await supabase
        .from("invoices")
        .update({
          issue_date: issueDate,
          due_date: dueDate,
          subtotal: calculated.subtotal,
          vat_total: calculated.vat_total,
          total: calculated.total,
        })
        .eq("id", invoiceId)
        .eq("company_id", company.id)
        .eq("status", "draft");

      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId).eq("company_id", company.id);
      await supabase.from("invoice_items").insert(
        calculated.items.map((item, index) => ({
          company_id: company.id,
          invoice_id: invoiceId,
          sort_order: index + 1,
          ...item,
        })),
      );
    }
  }

  revalidatePath(invoiceId ? `/invoices/${invoiceId}` : "/invoices");
}

export async function generateInvoicePDF(invoiceId: string) {
  if (hasSupabaseEnv()) {
    await generateAndStoreInvoicePdf(invoiceId);
  }

  revalidatePath(`/invoices/${invoiceId}`);
}

export async function sendInvoice(invoiceId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    const { data: invoice } = await supabase.from("invoices").select("*, customers(email)").eq("id", invoiceId).maybeSingle();
    const pdf = await generateAndStoreInvoicePdf(invoiceId);
    const pdfUrl = pdf?.pdfUrl ?? invoice?.pdf_url ?? null;

    if (company && invoice?.customers?.email) {
      await sendInvoiceEmail({
        to: invoice.customers.email,
        invoiceNumber: invoice.invoice_number,
        pdfUrl,
        pdfBuffer: pdf?.pdfBuffer,
      });

      const { count } = await supabase
        .from("reminders")
        .select("id", { count: "exact", head: true })
        .eq("invoice_id", invoiceId);

      if ((count ?? 0) === 0) {
        await supabase.from("reminders").insert({
          company_id: company.id,
          invoice_id: invoiceId,
          reminder_number: 1,
          scheduled_for: new Date(`${invoice.due_date}T08:00:00.000Z`).toISOString(),
          status: "scheduled",
        });
      }
    }
    await supabase.from("invoices").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", invoiceId);
  }
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function markInvoicePaid(invoiceId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", invoiceId);
  }
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function cancelInvoice(invoiceId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase
      .from("invoices")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", invoiceId);
  }
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
