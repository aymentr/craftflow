import { ArrowRight, CheckCircle2, FileText, Timer } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto grid min-h-[92vh] max-w-5xl content-center px-4 py-10">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-700 font-black text-white">CF</span>
            <span className="text-lg font-bold">CraftFlow</span>
          </div>
          <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
        </nav>
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">Für Handwerker in Deutschland</p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-zinc-950 sm:text-6xl">
              Rechnung vom Handy in unter 60 Sekunden.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
              Kunden, Jobs, Leistungsnotizen, PDF-Rechnungen und Zahlungserinnerungen in einem schnellen Workflow für Betriebe mit 1 bis 10 Personen.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup">
                Kostenlos starten <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="secondary">Demo öffnen</ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="rounded-lg bg-zinc-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Job abgeschlossen</span>
                <CheckCircle2 className="text-emerald-300" />
              </div>
              <h2 className="mt-8 text-2xl font-bold">Deckenlampen installieren</h2>
              <p className="mt-2 text-zinc-300">3 Lampen, 2 Schalter, 2.5 Std.</p>
              <button className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 font-semibold text-zinc-950">
                <FileText size={18} /> Rechnung generieren
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-amber-50 p-4">
                <Timer className="mb-3 text-amber-700" />
                <p className="text-sm font-semibold">Fälligkeitsdatum automatisch</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4">
                <FileText className="mb-3 text-emerald-700" />
                <p className="text-sm font-semibold">PDF und E-Mail bereit</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
