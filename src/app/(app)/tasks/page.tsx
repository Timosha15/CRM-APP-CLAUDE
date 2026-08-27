"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TaskForm } from "@/components/tasks/TaskForm";
import { IconCheckSquare, IconPlus, IconClock, IconPhone, IconMail, IconCalendar, IconNote } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { TASK_TYPE_LABEL } from "@/lib/labels";
import type { TaskType } from "@prisma/client";

type Task = {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  dueDate: string | null;
  completed: boolean;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

const filters = [
  { key: "open", label: "Open" },
  { key: "today", label: "Due today" },
  { key: "overdue", label: "Overdue" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
] as const;

const typeIcon: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  CALL: IconPhone,
  EMAIL: IconMail,
  MEETING: IconCalendar,
  FOLLOW_UP: IconClock,
  TODO: IconNote,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("open");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const res = await fetch(`/api/tasks?filter=${filter}`);
    setTasks(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function toggle(task: Task) {
    setTasks((prev) => prev?.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)) ?? prev);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Calls, follow-ups, and to-dos across your pipeline."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <IconPlus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5 px-4 py-4 sm:px-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.key ? "bg-brand-600 text-white" : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 sm:px-6">
        {tasks === null ? (
          <div className="h-64 animate-pulse rounded-xl bg-white" />
        ) : tasks.length === 0 ? (
          <EmptyState icon={<IconCheckSquare className="h-10 w-10" />} title="Nothing here" description="You're all caught up." />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            {tasks.map((t) => {
              const overdue = t.dueDate && !t.completed && isPast(new Date(t.dueDate));
              const Icon = typeIcon[t.type];
              return (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggle(t)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500")}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", t.completed ? "text-slate-400 line-through" : "text-slate-800")}>
                      {t.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                      <Badge tone="slate">{TASK_TYPE_LABEL[t.type]}</Badge>
                      {t.dueDate ? (
                        <span className={cn("flex items-center gap-1", overdue && "text-red-500")}>
                          <IconClock className="h-3 w-3" />
                          {format(new Date(t.dueDate), "MMM d, yyyy")}
                        </span>
                      ) : null}
                      {t.contact ? (
                        <Link href={`/contacts/${t.contact.id}`} className="hover:text-brand-600 hover:underline">
                          {t.contact.firstName} {t.contact.lastName}
                        </Link>
                      ) : null}
                      {t.deal ? (
                        <Link href={`/deals/${t.deal.id}`} className="hover:text-brand-600 hover:underline">
                          {t.deal.title}
                        </Link>
                      ) : null}
                      {t.company ? (
                        <Link href={`/companies/${t.company.id}`} className="hover:text-brand-600 hover:underline">
                          {t.company.name}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New task">
        <TaskForm
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}
