"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Avatar } from "@/components/ui/Avatar";
import {
  IconUsers,
  IconTarget,
  IconDollar,
  IconTrendingUp,
  IconClock,
  IconAlert,
  IconNote,
  IconPhone,
  IconMail,
  IconPlus,
} from "@/components/ui/icons";
import { formatCurrency } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { ActivityType, DealStage } from "@prisma/client";

type Stats = {
  contactCount: number;
  companyCount: number;
  openDealsCount: number;
  openPipelineValue: number;
  wonThisMonthValue: number;
  wonThisMonthCount: number;
  tasksDueToday: number;
  tasksOverdue: number;
  dealsByStage: { stage: DealStage; count: number; value: number }[];
  recentActivities: {
    id: string;
    type: ActivityType;
    content: string;
    createdAt: string;
    owner: { name: string; avatarColor: string } | null;
    contact: { id: string; firstName: string; lastName: string } | null;
    company: { id: string; name: string } | null;
    deal: { id: string; title: string } | null;
  }[];
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: string | null;
    contact: { id: string; firstName: string; lastName: string } | null;
    deal: { id: string; title: string } | null;
  }[];
};

const activityIcon: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  NOTE: IconNote,
  CALL: IconPhone,
  EMAIL: IconMail,
  STATUS_CHANGE: IconTrendingUp,
  CREATED: IconPlus,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" description="Your pipeline at a glance." />

      <div className="space-y-5 p-4 sm:p-6">
        {!stats ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Open pipeline"
                value={formatCurrency(stats.openPipelineValue)}
                sub={`${stats.openDealsCount} open deals`}
                icon={<IconDollar className="h-4 w-4" />}
                tone="brand"
              />
              <StatCard
                label="Won this month"
                value={formatCurrency(stats.wonThisMonthValue)}
                sub={`${stats.wonThisMonthCount} deals closed`}
                icon={<IconTrendingUp className="h-4 w-4" />}
                tone="green"
              />
              <StatCard
                label="Contacts"
                value={String(stats.contactCount)}
                sub={`${stats.companyCount} companies`}
                icon={<IconUsers className="h-4 w-4" />}
                tone="slate"
              />
              <StatCard
                label="Tasks due today"
                value={String(stats.tasksDueToday)}
                sub={stats.tasksOverdue > 0 ? `${stats.tasksOverdue} overdue` : "None overdue"}
                icon={<IconClock className="h-4 w-4" />}
                tone={stats.tasksOverdue > 0 ? "amber" : "slate"}
              />
            </div>

            {stats.tasksOverdue > 0 ? (
              <Link
                href="/tasks"
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100"
              >
                <IconAlert className="h-4 w-4 shrink-0" />
                You have {stats.tasksOverdue} overdue {stats.tasksOverdue === 1 ? "task" : "tasks"}. Review them now.
              </Link>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Pipeline by stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineChart data={stats.dealsByStage} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.upcomingTasks.length === 0 ? (
                    <p className="text-sm text-slate-400">Nothing scheduled.</p>
                  ) : (
                    <ul className="space-y-3">
                      {stats.upcomingTasks.map((t) => {
                        const overdue = t.dueDate && isPast(new Date(t.dueDate));
                        return (
                          <li key={t.id}>
                            <p className="truncate text-sm font-medium text-slate-700">{t.title}</p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                              {t.dueDate ? (
                                <span className={cn(overdue && "font-medium text-red-500")}>
                                  {format(new Date(t.dueDate), "MMM d")}
                                </span>
                              ) : null}
                              {t.contact ? (
                                <>
                                  <span>·</span>
                                  <Link href={`/contacts/${t.contact.id}`} className="hover:text-brand-600 hover:underline">
                                    {t.contact.firstName} {t.contact.lastName}
                                  </Link>
                                </>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link href="/tasks" className="mt-4 inline-block text-xs font-medium text-brand-600 hover:text-brand-700">
                    View all tasks →
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivities.length === 0 ? (
                  <p className="text-sm text-slate-400">Nothing has happened yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {stats.recentActivities.map((a) => {
                      const Icon = activityIcon[a.type];
                      const target = a.contact
                        ? { href: `/contacts/${a.contact.id}`, label: `${a.contact.firstName} ${a.contact.lastName}` }
                        : a.deal
                          ? { href: `/deals/${a.deal.id}`, label: a.deal.title }
                          : a.company
                            ? { href: `/companies/${a.company.id}`, label: a.company.name }
                            : null;
                      return (
                        <li key={a.id} className="flex gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-700">
                              {a.content}
                              {target ? (
                                <>
                                  {" "}
                                  <Link href={target.href} className="font-medium text-brand-600 hover:underline">
                                    {target.label}
                                  </Link>
                                </>
                              ) : null}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                              {a.owner ? (
                                <>
                                  <Avatar name={a.owner.name} color={a.owner.avatarColor} size={16} />
                                  <span>{a.owner.name}</span>
                                  <span>·</span>
                                </>
                              ) : null}
                              <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
