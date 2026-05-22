import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/back-button";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen pb-20 lg:flex lg:pb-0">
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
        <MobileHeader title={title} />
        <main className="mx-auto w-full max-w-5xl px-4 py-5 md:py-8">
          <BackButton />
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
