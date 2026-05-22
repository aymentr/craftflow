import { sendInvoiceEmail } from "@/lib/email/send-invoice";
import { requireCronSecret } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    requireCronSecret();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Missing cron secret." }, { status: 500 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Supabase admin configuration error." }, { status: 500 });
  }
  const now = new Date().toISOString();

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("id, invoice_id, reminder_number, invoices(invoice_number, due_date, pdf_url, total, customers(email))")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders ?? []) {
    const invoice = Array.isArray(reminder.invoices) ? reminder.invoices[0] : reminder.invoices;
    const customer = Array.isArray(invoice?.customers) ? invoice?.customers[0] : invoice?.customers;

    try {
      if (!invoice?.invoice_number || !customer?.email) {
        throw new Error("Invoice or customer email is missing.");
      }

      await sendInvoiceEmail({
        to: customer.email,
        invoiceNumber: invoice.invoice_number,
        pdfUrl: invoice.pdf_url,
      });

      await supabase
        .from("reminders")
        .update({ status: "sent", sent_at: now })
        .eq("id", reminder.id);

      await supabase
        .from("invoices")
        .update({ status: "overdue" })
        .eq("id", reminder.invoice_id)
        .eq("status", "sent");

      sent += 1;
    } catch (sendError) {
      await supabase
        .from("reminders")
        .update({
          status: "failed",
          failure_reason: sendError instanceof Error ? sendError.message : "Reminder send failed.",
        })
        .eq("id", reminder.id);
      failed += 1;
    }
  }

  return Response.json({ processed: reminders?.length ?? 0, sent, failed });
}
