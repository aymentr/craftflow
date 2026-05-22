import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerDisplayName, getInvoices } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; pdf?: string; sent?: string; paid?: string; cancelled?: string }>;
}) {
  const invoices = await getInvoices();
  const params = searchParams ? await searchParams : {};

  return (
    <AppShell title="Rechnungen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Rechnungen</h1>
        <p className="text-sm text-zinc-600">Entwürfe, offene Beträge und Zahlungseingänge.</p>
      </div>
      {params.saved ? <Notice>Rechnung gespeichert.</Notice> : null}
      {params.pdf ? <Notice>PDF erstellt.</Notice> : null}
      {params.sent ? <Notice>Rechnung gesendet.</Notice> : null}
      {params.paid ? <Notice>Rechnung als bezahlt markiert.</Notice> : null}
      {params.cancelled ? <Notice>Rechnung storniert.</Notice> : null}
      {invoices.length === 0 ? (
        <EmptyState
          title="Noch keine Rechnungen"
          description="Schließe einen Job ab und erstelle daraus den ersten Rechnungsentwurf."
          action={<ButtonLink href="/jobs">Zu den Jobs</ButtonLink>}
        />
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
