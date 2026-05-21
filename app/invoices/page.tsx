import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerDisplayName, getInvoices } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <AppShell title="Rechnungen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Rechnungen</h1>
        <p className="text-sm text-zinc-600">Entwürfe, offene Beträge und Zahlungseingänge.</p>
      </div>
      {invoices.length === 0 ? (
        <EmptyState title="Noch keine Rechnungen" description="Schließe einen Job ab und erstelle daraus den ersten Entwurf." />
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice) => (
            <a key={invoice.id} href={`/invoices/${invoice.id}`} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{invoice.invoice_number}</p>
                  <p className="text-sm text-zinc-600">{customerDisplayName(invoice.customers)}</p>
                  <p className="mt-1 text-sm text-zinc-500">Fällig {formatDate(invoice.due_date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(invoice.total)}</p>
                  <StatusBadge status={invoice.status} className="mt-2" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </AppShell>
  );
}
