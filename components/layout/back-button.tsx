"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const topLevelPaths = new Set([
  "/dashboard",
  "/customers",
  "/jobs",
  "/invoices",
  "/settings/company",
]);

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (topLevelPaths.has(pathname)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
    >
      <ArrowLeft size={18} />
      Zurück
    </button>
  );
}
