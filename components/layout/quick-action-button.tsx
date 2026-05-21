import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <ButtonLink href={href} className="fixed bottom-20 right-4 z-20 shadow-lg md:static md:shadow-none">
      <Plus size={18} />
      {label}
    </ButtonLink>
  );
}
