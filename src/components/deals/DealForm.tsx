"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { DEAL_STAGE_LABEL } from "@/lib/labels";

export type DealFormValues = {
  id?: string;
  title: string;
  value: string;
  stage: keyof typeof DEAL_STAGE_LABEL;
  probability: string;
  closeDate: string;
  companyId: string;
  contactId: string;
  notes: string;
};

export function DealForm({
  initial,
  defaultCompanyId,
  defaultContactId,
  onSuccess,
  onCancel,
}: {
  initial?: Partial<DealFormValues>;
  defaultCompanyId?: string | null;
  defaultContactId?: string | null;
  onSuccess: (deal: { id: string }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<DealFormValues>({
    title: "",
    value: "",
    stage: "NEW",
    probability: "20",
    closeDate: "",
    companyId: defaultCompanyId ?? "",
    contactId: defaultContactId ?? "",
    notes: "",
    ...initial,
  });
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; firstName: string; lastName: string; companyId: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))));
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) =>
        setContacts(
          data.map((c: { id: string; firstName: string; lastName: string; companyId: string | null }) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            companyId: c.companyId,
          })),
        ),
      );
  }, []);

  function set<K extends keyof DealFormValues>(key: K, value: DealFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const visibleContacts = values.companyId
    ? contacts.filter((c) => c.companyId === values.companyId)
    : contacts;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isEdit = Boolean(values.id);
      const res = await fetch(isEdit ? `/api/deals/${values.id}` : "/api/deals", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          value: Number(values.value) || 0,
          probability: Number(values.probability) || 0,
          companyId: values.companyId || null,
          contactId: values.contactId || null,
          closeDate: values.closeDate || null,
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
      <Field label="Deal title">
        <Input required value={values.title} onChange={(e) => set("title", e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Value (USD)">
          <Input
            type="number"
            min={0}
            value={values.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Stage">
          <Select value={values.stage} onChange={(e) => set("stage", e.target.value as DealFormValues["stage"])}>
            {Object.entries(DEAL_STAGE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Probability (%)">
          <Input
            type="number"
            min={0}
            max={100}
            value={values.probability}
            onChange={(e) => set("probability", e.target.value)}
          />
        </Field>
        <Field label="Expected close date">
          <Input type="date" value={values.closeDate} onChange={(e) => set("closeDate", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <Select value={values.companyId} onChange={(e) => set("companyId", e.target.value)}>
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Primary contact">
          <Select value={values.contactId} onChange={(e) => set("contactId", e.target.value)}>
            <option value="">No contact</option>
            {visibleContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notes">
        <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : values.id ? "Save changes" : "Create deal"}
        </Button>
      </div>
    </form>
  );
}
