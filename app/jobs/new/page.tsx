import { AppShell } from "@/components/layout/app-shell";
import { JobForm } from "@/components/jobs/job-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomers } from "@/lib/db/queries";

export default async function NewJobPage() {
  const customers = await getCustomers();

  return (
    <AppShell title="Neuer Job">
      <h1 className="mb-5 text-2xl font-bold">Job erfassen</h1>
      {customers.length === 0 ? (
        <EmptyState title="Noch keine Kunden" description="Lege zuerst einen Kunden an, dann kannst du einen Job erfassen." />
      ) : (
        <JobForm customers={customers} />
      )}
    </AppShell>
  );
}
