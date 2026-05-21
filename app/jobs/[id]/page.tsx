import { notFound } from "next/navigation";
import { CheckCircle2, FileText, Trash2 } from "lucide-react";
import { JobForm } from "@/components/jobs/job-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerDisplayName, getCustomers, getJobById } from "@/lib/db/queries";
import { completeJob, deleteJobById, updateJobById } from "@/server/actions/jobs";
import { generateInvoiceFromJob } from "@/server/actions/invoices";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, customers] = await Promise.all([getJobById(id), getCustomers()]);
  if (!job) notFound();
  const generateAction = generateInvoiceFromJob.bind(null, job.id);
  const completeAction = completeJob.bind(null, job.id);
  const updateAction = updateJobById.bind(null, job.id);
  const deleteAction = deleteJobById.bind(null, job.id);

  return (
    <AppShell title="Job">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="mt-1 text-sm text-zinc-600">{customerDisplayName(job.customers)}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          <div>
            <dt className="font-semibold">Einsatzort</dt>
            <dd className="text-zinc-600">{job.location}</dd>
          </div>
          <div>
            <dt className="font-semibold">Beschreibung</dt>
            <dd className="text-zinc-600">{job.description}</dd>
          </div>
          <div>
            <dt className="font-semibold">Arbeitszeit</dt>
            <dd className="text-zinc-600">{job.labor_hours} Std.</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-3">
          {job.status === "active" || job.status === "draft" ? (
            <form action={completeAction}>
              <Button type="submit" variant="secondary" className="w-full">
                <CheckCircle2 size={18} /> Als erledigt markieren
              </Button>
            </form>
          ) : null}
          {job.status === "completed" ? (
            <form action={generateAction}>
              <Button type="submit" className="w-full">
                <FileText size={18} /> Rechnung generieren
              </Button>
            </form>
          ) : null}
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">Job bearbeiten</h2>
        <JobForm customers={customers} job={job} action={updateAction} />
      </section>
      <form action={deleteAction} className="mt-4">
        <Button type="submit" variant="danger" className="w-full">
          <Trash2 size={18} /> Job löschen
        </Button>
      </form>
    </AppShell>
  );
}
