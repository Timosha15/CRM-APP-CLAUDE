"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "@/components/tasks/TaskForm";
import { IconPlus, IconClock } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { TASK_TYPE_LABEL } from "@/lib/labels";

export type MiniTask = {
  id: string;
  title: string;
  type: keyof typeof TASK_TYPE_LABEL;
  dueDate: string | null;
  completed: boolean;
};

export function TaskMiniList({
  tasks,
  contactId,
  companyId,
  dealId,
  onChange,
}: {
  tasks: MiniTask[];
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  onChange: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  async function toggle(task: MiniTask) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    onChange();
  }

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tasks</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <IconPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {[...open, ...done].map((t) => {
            const overdue = t.dueDate && !t.completed && isPast(new Date(t.dueDate));
            return (
              <li key={t.id} className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggle(t)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <div className="min-w-0">
                  <p className={cn("text-sm", t.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>{TASK_TYPE_LABEL[t.type]}</span>
                    {t.dueDate ? (
                      <>
                        <span>·</span>
                        <span className={cn("flex items-center gap-0.5", overdue && "text-red-500")}>
                          <IconClock className="h-3 w-3" />
                          {format(new Date(t.dueDate), "MMM d")}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New task">
        <TaskForm
          contactId={contactId}
          companyId={companyId}
          dealId={dealId}
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            onChange();
          }}
        />
      </Modal>
    </div>
  );
}
