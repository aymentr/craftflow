import { AppShell } from "@/components/layout/app-shell";
import { QuickActionButton } from "@/components/layout/quick-action-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomers } from "@/lib/db/queries";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <AppShell title="Kunden">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kunden</h1>
          <p className="text-sm text-zinc-600">Kontakte und Rechnungsadressen.</p>
        </div>
        <div className="hidden md:block"><QuickActionButton href="/customers/new" label="Kunde" /></div>
      </div>
      {customers.length === 0 ? (
        <EmptyState
          title="Noch keine Kunden"
          description="Lege zuerst einen Kunden mit Rechnungsadresse an. Danach kannst du direkt den ersten Job erfassen."
          action={<ButtonLink href="/customers/new">Kunde anlegen</ButtonLink>}
        />
      ) : (
        <div className="grid gap-3">
          {customers.map((customer) => (
            <a key={customer.id} href={`/customers/${customer.id}`} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="font-semibold">{customer.business_name || customer.name}</p>
              <p className="text-sm text-zinc-600">{customer.name} · {customer.email}</p>
              <p className="mt-1 text-sm text-zinc-500">{customer.postal_code} {customer.city}</p>
            </a>
          ))}
        </div>
      )}
      <div className="md:hidden"><QuickActionButton href="/customers/new" label="Kunde" /></div>
    </AppShell>
  );
}
