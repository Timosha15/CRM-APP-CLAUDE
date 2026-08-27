"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { IconHome, IconUsers, IconBuilding, IconTarget, IconCheckSquare } from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/contacts", label: "Contacts", icon: IconUsers },
  { href: "/companies", label: "Companies", icon: IconBuilding },
  { href: "/deals", label: "Pipeline", icon: IconTarget },
  { href: "/tasks", label: "Tasks", icon: IconCheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="text-xs text-slate-400">Victor CRM · v0.1</p>
      </div>
    </aside>
  );
}
