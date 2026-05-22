import { AppShell } from "@/components/layout/app-shell";
import { CustomerForm } from "@/components/customers/customer-form";

export const dynamic = "force-dynamic";

export default function NewCustomerPage() {
  return (
    <AppShell title="Neuer Kunde">
      <h1 className="mb-5 text-2xl font-bold">Kunde erstellen</h1>
      <CustomerForm />
    </AppShell>
  );
}
