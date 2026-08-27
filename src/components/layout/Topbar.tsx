"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch, IconLogOut, IconChevronDown, IconUsers, IconBuilding, IconTarget } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/labels";

type SearchResult = {
  contacts: { id: string; firstName: string; lastName: string; email: string | null; company: { name: string } | null }[];
  companies: { id: string; name: string; domain: string | null }[];
  deals: { id: string; title: string; value: number }[];
};

export function Topbar({ user }: { user: { name: string; email: string; avatarColor: string } }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setResults(await res.json());
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const hasResults =
    results && (results.contacts.length || results.companies.length || results.deals.length);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div ref={containerRef} className="relative flex-1 max-w-md">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search contacts, companies, deals…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {open && query.trim().length >= 2 ? (
          <div className="absolute left-0 right-0 top-11 z-40 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
            {!hasResults ? (
              <p className="px-4 py-3 text-sm text-slate-400">No results for &ldquo;{query}&rdquo;</p>
            ) : (
              <>
                {results!.contacts.length > 0 && (
                  <ResultGroup label="Contacts" icon={IconUsers}>
                    {results!.contacts.map((c) => (
                      <ResultRow
                        key={c.id}
                        href={`/contacts/${c.id}`}
                        onClick={() => setOpen(false)}
                        title={`${c.firstName} ${c.lastName}`}
                        subtitle={c.company?.name ?? c.email ?? undefined}
                      />
                    ))}
                  </ResultGroup>
                )}
                {results!.companies.length > 0 && (
                  <ResultGroup label="Companies" icon={IconBuilding}>
                    {results!.companies.map((c) => (
                      <ResultRow
                        key={c.id}
                        href={`/companies/${c.id}`}
                        onClick={() => setOpen(false)}
                        title={c.name}
                        subtitle={c.domain ?? undefined}
                      />
                    ))}
                  </ResultGroup>
                )}
                {results!.deals.length > 0 && (
                  <ResultGroup label="Deals" icon={IconTarget}>
                    {results!.deals.map((d) => (
                      <ResultRow
                        key={d.id}
                        href={`/deals/${d.id}`}
                        onClick={() => setOpen(false)}
                        title={d.title}
                        subtitle={formatCurrency(d.value)}
                      />
                    ))}
                  </ResultGroup>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>

      <div ref={menuRef} className="relative ml-auto">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
        >
          <Avatar name={user.name} color={user.avatarColor} size={30} />
          <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.name}</span>
          <IconChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-12 z-40 w-56 rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl">
            <div className="border-b border-slate-100 px-3.5 py-2.5">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
            >
              <IconLogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  onClick,
}: {
  href: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
    >
      <span className="font-medium text-slate-800">{title}</span>
      {subtitle ? <span className="truncate pl-3 text-xs text-slate-400">{subtitle}</span> : null}
    </Link>
  );
}
