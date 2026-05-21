import { notFound } from "next/navigation";
import { Check, Download, FileDown, Mail, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { ReminderStatus } from "@/components/reminders/reminder-status";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInvoiceBundle } from "@/lib/db/queries";
import { cancelInvoice, generateInvoicePDF, markInvoicePaid, sendInvoice } from "@/server/actions/invoices";
import { scheduleReminder } from "@/server/actions/reminders";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { company, customer, invoice, items, reminders } = await getInvoiceBundle(id);
  if (!company || !customer || !invoice) notFound();
  const isFinal = invoice.status === "paid" || invoice.status === "cancelled";
  const canSend = invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue";
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue";
  const canScheduleReminder = invoice.status === "sent" || invoice.status === "overdue";
  const hasScheduledReminder = reminders.some((reminder) => reminder.status === "scheduled");
  const canCancel = invoice.status !== "paid" && invoice.status !== "cancelled";
  const sendLabel = invoice.status === "draft" ? "Senden" : "Erneut senden";

  return (
    <AppShell title="Rechnung">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-sm text-zinc-600">{customer.business_name || customer.name}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <InvoicePreview company={company} customer={customer} invoice={invoice} items={items} />
        <aside className="grid content-start gap-3">
          {isFinal ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              Diese Rechnung ist abgeschlossen. Änderungen und Folgeaktionen sind eingeschränkt.
            </div>
          ) : null}
          <InvoiceForm invoice={invoice} items={items} />
          <form action={sendInvoice.bind(null, invoice.id)}>
            <Button type="submit" className="w-full" disabled={!canSend}><Mail size={18} /> {sendLabel}</Button>
          </form>
          <form action={generateInvoicePDF.bind(null, invoice.id)}>
            <Button type="submit" variant="secondary" className="w-full" disabled={invoice.status === "cancelled"}>
              <Download size={18} /> {invoice.pdf_url ? "PDF aktualisieren" : "PDF erstellen"}
            </Button>
          </form>
          <ButtonLink href={`/api/invoices/${invoice.id}/pdf`} variant="secondary" className="w-full">
            <FileDown size={18} /> PDF herunterladen
          </ButtonLink>
          <form action={markInvoicePaid.bind(null, invoice.id)}>
            <Button type="submit" variant="secondary" className="w-full" disabled={!canMarkPaid}><Check size={18} /> Bezahlt markieren</Button>
          </form>
          <form action={scheduleReminder.bind(null, invoice.id, undefined)}>
            <Button type="submit" variant="secondary" className="w-full" disabled={!canScheduleReminder || hasScheduledReminder}>
              {hasScheduledReminder ? "Mahnung geplant" : "Mahnung planen"}
            </Button>
          </form>
          <form action={cancelInvoice.bind(null, invoice.id)}>
            <ConfirmSubmitButton message="Diese Rechnung wirklich stornieren?" className="w-full" disabled={!canCancel}>
              <X size={18} /> Stornieren
            </ConfirmSubmitButton>
          </form>
          <div className="grid gap-2">
            <h2 className="text-sm font-bold">Erinnerungen</h2>
            {reminders.map((reminder) => <ReminderStatus key={reminder.id} reminder={reminder} />)}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
