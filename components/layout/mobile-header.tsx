import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { logout } from "@/server/actions/auth";

export function MobileHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-stone-50/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-700 text-sm font-black text-white">
            CF
          </span>
          <span className="text-base font-bold text-zinc-950">{title ?? "CraftFlow"}</span>
        </Link>
        <div className="flex items-center gap-1">
          <button className="grid size-10 place-items-center rounded-lg text-zinc-700 hover:bg-zinc-100" aria-label="Benachrichtigungen">
            <Bell size={20} />
          </button>
          <form action={logout}>
            <button className="grid size-10 place-items-center rounded-lg text-zinc-700 hover:bg-zinc-100" aria-label="Ausloggen">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
