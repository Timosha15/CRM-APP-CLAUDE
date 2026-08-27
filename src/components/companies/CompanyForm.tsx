"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";

export type CompanyFormValues = {
  id?: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  phone: string;
  address: string;
  notes: string;
};

const empty: CompanyFormValues = {
  name: "",
  domain: "",
  industry: "",
  size: "",
  phone: "",
  address: "",
  notes: "",
};

export function CompanyForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: Partial<CompanyFormValues>;
  onSuccess: (company: { id: string }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<CompanyFormValues>({ ...empty, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isEdit = Boolean(values.id);
      const res = await fetch(isEdit ? `/api/companies/${values.id}` : "/api/companies", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      <Field label="Company name">
        <Input required value={values.name} onChange={(e) => set("name", e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Website / domain">
          <Input
            value={values.domain}
            onChange={(e) => set("domain", e.target.value)}
            placeholder="acme.com"
          />
        </Field>
        <Field label="Industry">
          <Input value={values.industry} onChange={(e) => set("industry", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company size">
          <Input
            value={values.size}
            onChange={(e) => set("size", e.target.value)}
            placeholder="e.g. 51-200"
          />
        </Field>
        <Field label="Phone">
          <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>
      <Field label="Address">
        <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Notes">
        <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : values.id ? "Save changes" : "Create company"}
        </Button>
      </div>
    </form>
  );
}
