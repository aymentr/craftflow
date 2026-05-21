import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <MobileHeader title={title} />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:py-8">{children}</main>
      <BottomNav />
    </div>
  );
}
