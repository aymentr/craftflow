import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { CustomerForm } from "@/components/customers/customer-form";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCustomerBundle } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";
import { deleteCustomerById, updateCustomerById } from "@/server/actions/customers";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer, jobs, invoices } = await getCustomerBundle(id);
  if (!customer) notFound();
  const updateAction = updateCustomerById.bind(null, customer.id);
  const deleteAction = deleteCustomerById.bind(null, customer.id);

  return (
    <AppShell title="Kunde">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h1 className="text-2xl font-bold">{customer.business_name || customer.name}</h1>
        <p className="mt-1 text-sm text-zinc-600">{customer.name} · {customer.email}</p>
        <p className="mt-4 text-sm">{customer.street}, {customer.postal_code} {customer.city}</p>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Jobs</h2>
        {jobs.length === 0 ? (
          <EmptyState title="Keine Jobs" description="Für diesen Kunden wurde noch kein Einsatz erfasst." />
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <a key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
                <span className="font-semibold">{job.title}</span>
                <StatusBadge status={job.status} />
              </a>
            ))}
          </div>
        )}
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Rechnungen</h2>
        {invoices.length === 0 ? (
          <EmptyState title="Keine Rechnungen" description="Sobald ein Job abgeschlossen ist, kannst du daraus eine Rechnung erstellen." />
        ) : (
          <div className="grid gap-3">
            {invoices.map((invoice) => (
              <a key={invoice.id} href={`/invoices/${invoice.id}`} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
                <span className="font-semibold">{invoice.invoice_number}</span>
                <span>{formatCurrency(invoice.total)}</span>
              </a>
            ))}
          </div>
        )}
      </section>
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">Kundendaten bearbeiten</h2>
        <CustomerForm customer={customer} action={updateAction} />
      </section>
      <form action={deleteAction} className="mt-4">
        <ConfirmSubmitButton message="Diesen Kunden wirklich löschen? Zugehörige Daten können davon betroffen sein." className="w-full">
          <Trash2 size={18} /> Kunde löschen
        </ConfirmSubmitButton>
      </form>
    </AppShell>
  );
}
