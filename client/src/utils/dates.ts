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
