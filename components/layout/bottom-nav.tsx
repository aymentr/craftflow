"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                active ? "text-emerald-700" : "text-zinc-500",
              )}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
