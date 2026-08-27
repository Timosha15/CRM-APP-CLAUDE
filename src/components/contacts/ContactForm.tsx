"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { CONTACT_STATUS_LABEL } from "@/lib/labels";

export type ContactFormValues = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  status: keyof typeof CONTACT_STATUS_LABEL;
  source: string;
  companyId: string;
  notes: string;
};

const empty: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  title: "",
  status: "LEAD",
  source: "",
  companyId: "",
  notes: "",
};

export function ContactForm({
  initial,
  defaultCompanyId,
  onSuccess,
  onCancel,
}: {
  initial?: Partial<ContactFormValues>;
  defaultCompanyId?: string;
  onSuccess: (contact: { id: string }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ContactFormValues>({
    ...empty,
    ...initial,
    companyId: initial?.companyId ?? defaultCompanyId ?? "",
  });
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, []);

  function set<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isEdit = Boolean(values.id);
      const res = await fetch(isEdit ? `/api/contacts/${values.id}` : "/api/contacts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          companyId: values.companyId || null,
          email: values.email || null,
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input required value={values.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Last name">
          <Input required value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Job title">
          <Input value={values.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={values.status} onChange={(e) => set("status", e.target.value as ContactFormValues["status"])}>
            {Object.entries(CONTACT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
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
        <Field label="Source">
          <Input
            value={values.source}
            onChange={(e) => set("source", e.target.value)}
            placeholder="e.g. Referral"
          />
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
          {loading ? "Saving…" : values.id ? "Save changes" : "Create contact"}
        </Button>
      </div>
    </form>
  );
}
