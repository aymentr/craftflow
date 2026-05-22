"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorPanel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl content-center px-4">
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-red-700">
          <AlertTriangle size={24} />
          <h1 className="text-xl font-bold text-zinc-950">Aktion fehlgeschlagen</h1>
        </div>
        <p className="text-sm leading-6 text-zinc-600">
          Die letzte Aktion konnte nicht abgeschlossen werden. Prüfe die Eingaben und versuche es erneut.
        </p>
        {error.message ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error.message}</p>
        ) : null}
        <Button type="button" className="mt-5" onClick={reset}>
          <RotateCw size={18} />
          Erneut versuchen
        </Button>
      </div>
    </div>
  );
}
