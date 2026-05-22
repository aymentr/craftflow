import { AppShell } from "@/components/layout/app-shell";
import { QuickActionButton } from "@/components/layout/quick-action-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerDisplayName, getJobs } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; updated?: string; completed?: string; deleted?: string }>;
}) {
  const jobs = await getJobs();
  const params = searchParams ? await searchParams : {};

  return (
    <AppShell title="Jobs">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-zinc-600">Vom Einsatz bis zur Rechnung.</p>
        </div>
        <div className="hidden md:block"><QuickActionButton href="/jobs/new" label="Job" /></div>
      </div>
      {params.saved ? <Notice>Job gespeichert.</Notice> : null}
      {params.updated ? <Notice>Job aktualisiert.</Notice> : null}
      {params.completed ? <Notice>Job als erledigt markiert.</Notice> : null}
      {params.deleted ? <Notice>Job gelöscht.</Notice> : null}
      {jobs.length === 0 ? (
        <EmptyState
          title="Noch keine Jobs"
          description="Erfasse den Einsatz, notiere Arbeitszeit und Material, und markiere ihn nach Abschluss als erledigt."
          action={<ButtonLink href="/jobs/new">Job erfassen</ButtonLink>}
        />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <a key={job.id} href={`/jobs/${job.id}`} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-zinc-600">{customerDisplayName(job.customers)}</p>
                  <p className="mt-1 text-sm text-zinc-500">{job.location} · {formatDate(job.created_at)}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </a>
          ))}
        </div>
      )}
      <div className="md:hidden"><QuickActionButton href="/jobs/new" label="Job" /></div>
    </AppShell>
  );
}
