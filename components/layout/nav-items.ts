import { BriefcaseBusiness, FileText, Home, Settings, Users } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Start", icon: Home },
  { href: "/customers", label: "Kunden", icon: Users },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/invoices", label: "Rechnungen", icon: FileText },
  { href: "/settings/company", label: "Firma", icon: Settings },
];
