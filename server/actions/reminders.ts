"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCompany, hasSupabaseEnv } from "@/lib/db/queries";
import { sendInvoiceEmail } from "@/lib/email/send-invoice";
import { createClient } from "@/lib/supabase/server";

export async function scheduleReminder(invoiceId: string, scheduledFor?: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const company = await getCurrentCompany();
    const { count } = await supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("invoice_id", invoiceId);

    if (company) {
      await supabase.from("reminders").insert({
        company_id: company.id,
        invoice_id: invoiceId,
        reminder_number: (count ?? 0) + 1,
        scheduled_for: scheduledFor ?? new Date().toISOString(),
        status: "scheduled",
      });
    }
  }
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function sendReminder(invoiceId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data: invoice } = await supabase.from("invoices").select("*, customers(email)").eq("id", invoiceId).maybeSingle();
    if (invoice?.customers?.email) {
      await sendInvoiceEmail({
        to: invoice.customers.email,
        invoiceNumber: invoice.invoice_number,
        pdfUrl: invoice.pdf_url,
      });
      await supabase
        .from("reminders")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("invoice_id", invoiceId)
        .eq("status", "scheduled");
    }
  }
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function cancelReminder(reminderId: string) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.from("reminders").update({ status: "cancelled" }).eq("id", reminderId);
  }
}

export async function getOverdueInvoices() {
  if (!hasSupabaseEnv()) {
    return [];
  }
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .in("status", ["sent", "overdue"])
    .lt("due_date", today);
  return data ?? [];
}
