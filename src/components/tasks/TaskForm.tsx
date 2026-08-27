"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { TASK_TYPE_LABEL } from "@/lib/labels";

export type TaskFormValues = {
  id?: string;
  title: string;
  description: string;
  type: keyof typeof TASK_TYPE_LABEL;
  dueDate: string;
};

export function TaskForm({
  initial,
  contactId,
  companyId,
  dealId,
  onSuccess,
  onCancel,
}: {
  initial?: Partial<TaskFormValues>;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  onSuccess: (task: { id: string }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TaskFormValues>({
    title: "",
    description: "",
    type: "TODO",
    dueDate: new Date().toISOString().slice(0, 10),
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isEdit = Boolean(values.id);
      const res = await fetch(isEdit ? `/api/tasks/${values.id}` : "/api/tasks", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          contactId: contactId ?? null,
          companyId: companyId ?? null,
          dealId: dealId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onSuccess(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title">
        <Input required value={values.title} onChange={(e) => set("title", e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={values.type} onChange={(e) => set("type", e.target.value as TaskFormValues["type"])}>
            {Object.entries(TASK_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due date">
          <Input type="date" value={values.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : values.id ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
