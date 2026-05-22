"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { logout } from "@/server/actions/auth";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-zinc-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-700 text-sm font-black text-white">
            CF
          </span>
          <span className="text-lg font-bold text-zinc-950">CraftFlow</span>
        </Link>
      </div>
      <nav className="grid gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
                active ? "bg-emerald-50 text-emerald-800" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
              )}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-zinc-200 p-3">
        <form action={logout}>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950">
            <LogOut size={19} />
            Ausloggen
          </button>
        </form>
      </div>
    </aside>
  );
}
