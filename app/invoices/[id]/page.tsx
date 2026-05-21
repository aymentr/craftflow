import { notFound } from "next/navigation";
import { Check, Download, FileDown, Mail, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
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
          <InvoiceForm invoice={invoice} items={items} />
          <form action={sendInvoice.bind(null, invoice.id)}>
            <Button type="submit" className="w-full"><Mail size={18} /> Senden</Button>
          </form>
          <form action={generateInvoicePDF.bind(null, invoice.id)}>
            <Button type="submit" variant="secondary" className="w-full"><Download size={18} /> PDF erstellen</Button>
          </form>
          <ButtonLink href={`/api/invoices/${invoice.id}/pdf`} variant="secondary" className="w-full">
            <FileDown size={18} /> PDF herunterladen
          </ButtonLink>
          <form action={markInvoicePaid.bind(null, invoice.id)}>
            <Button type="submit" variant="secondary" className="w-full"><Check size={18} /> Bezahlt markieren</Button>
          </form>
          <form action={scheduleReminder.bind(null, invoice.id, undefined)}>
            <Button type="submit" variant="secondary" className="w-full">Mahnung planen</Button>
          </form>
          <form action={cancelInvoice.bind(null, invoice.id)}>
            <Button type="submit" variant="danger" className="w-full"><X size={18} /> Stornieren</Button>
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
