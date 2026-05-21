import { BriefcaseBusiness, FileText, Plus, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerDisplayName, getInvoices, getJobs } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [invoices, jobs] = await Promise.all([getInvoices(), getJobs()]);
  const unpaid = invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status));
  const overdue = invoices.filter((invoice) => invoice.status === "overdue");

  return (
    <AppShell title="Dashboard">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Heute</h1>
          <p className="text-sm text-zinc-600">Schneller Überblick für offene Arbeit.</p>
        </div>
        <ButtonLink href="/jobs/new"><Plus size={18} /> Job</ButtonLink>
      </div>
      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <WalletCards className="mb-3 text-emerald-700" />
          <p className="text-sm text-zinc-600">Unbezahlt</p>
          <p className="text-2xl font-bold">{formatCurrency(unpaid.reduce((sum, item) => sum + item.total, 0))}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <FileText className="mb-3 text-red-700" />
          <p className="text-sm text-zinc-600">Überfällig</p>
          <p className="text-2xl font-bold">{overdue.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <BriefcaseBusiness className="mb-3 text-blue-700" />
          <p className="text-sm text-zinc-600">Aktive Jobs</p>
          <p className="text-2xl font-bold">{jobs.filter((job) => job.status === "active").length}</p>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Letzte Jobs</h2>
        <div className="grid gap-3">
          {jobs.slice(0, 5).map((job) => (
            <a key={job.id} href={`/jobs/${job.id}`} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-zinc-600">{customerDisplayName(job.customers)} · {formatDate(job.created_at)}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
