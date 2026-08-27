import type { ContactStatus, DealStage, TaskType, ActivityType } from "@prisma/client";

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CUSTOMER: "Customer",
  CHURNED: "Churned",
};

export const CONTACT_STATUS_TONE: Record<ContactStatus, "slate" | "brand" | "green" | "red"> = {
  LEAD: "slate",
  PROSPECT: "brand",
  CUSTOMER: "green",
  CHURNED: "red",
};

export const DEAL_STAGES: DealStage[] = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const DEAL_STAGE_TONE: Record<DealStage, "slate" | "brand" | "amber" | "blue" | "green" | "red"> = {
  NEW: "slate",
  QUALIFIED: "blue",
  PROPOSAL: "brand",
  NEGOTIATION: "amber",
  WON: "green",
  LOST: "red",
};

export const DEAL_STAGE_BAR_COLOR: Record<DealStage, string> = {
  NEW: "#94a3b8",
  QUALIFIED: "#38bdf8",
  PROPOSAL: "#6d4cff",
  NEGOTIATION: "#f59e0b",
  WON: "#22c55e",
  LOST: "#ef4444",
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  FOLLOW_UP: "Follow-up",
  TODO: "To-do",
};

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  STATUS_CHANGE: "Status change",
  CREATED: "Created",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
