"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconHome, IconUsers, IconBuilding, IconTarget, IconCheckSquare } from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Home", icon: IconHome },
  { href: "/contacts", label: "Contacts", icon: IconUsers },
  { href: "/companies", label: "Companies", icon: IconBuilding },
  { href: "/deals", label: "Pipeline", icon: IconTarget },
  { href: "/tasks", label: "Tasks", icon: IconCheckSquare },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-slate-200 bg-white lg:hidden">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand-600" : "text-slate-500",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
