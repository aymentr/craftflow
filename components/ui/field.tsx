import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-950 outline-none ring-emerald-700/20 transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-4",
        props.className,
      )}
    />
  );
}

export function Textarea(props: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-zinc-950 outline-none ring-emerald-700/20 transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-4",
        props.className,
      )}
    />
  );
}

export function Select(props: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-950 outline-none ring-emerald-700/20 transition focus:border-emerald-700 focus:ring-4",
        props.className,
      )}
    />
  );
}
