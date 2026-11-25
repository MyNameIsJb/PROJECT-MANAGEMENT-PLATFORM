import type { TaskStatus } from "../types";

export const toDateInput = (iso?: string | null) =>
  iso ? iso.slice(0, 10) : "";

const todayString = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDueDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export type DueState = "overdue" | "today" | "upcoming";

export const getDueState = (
  iso: string | null | undefined,
  status: TaskStatus,
): DueState | null => {
  if (!iso || status === "done") return null;
  const due = toDateInput(iso);
  const today = todayString();
  if (due < today) return "overdue";
  if (due === today) return "today";
  return "upcoming";
};

export const timeAgo = (iso: string) => {
  const seconds = Math.floor(Date.now() - new Date(iso).getTime() / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
