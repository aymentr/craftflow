import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Notice({
  children,
  variant = "success",
}: {
  children: ReactNode;
  variant?: keyof typeof styles;
}) {
  return (
    <div className={cn("mb-4 rounded-lg border p-3 text-sm font-medium", styles[variant])}>
      {children}
    </div>
  );
}
