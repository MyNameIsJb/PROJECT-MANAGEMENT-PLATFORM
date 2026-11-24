import type { Task, TaskPriority } from "../types";
import { getDueState } from "./dates";

export interface TaskFilters {
  search: string;
  assignee: string;
  priority: "" | TaskPriority;
  overdueOnly: boolean;
}

export const EMPTY_FILTERS: TaskFilters = {
  search: "",
  assignee: "",
  priority: "",
  overdueOnly: false,
};

export const hasActiveFilters = (f: TaskFilters) =>
  f.search.trim() !== "" ||
  f.assignee !== "" ||
  f.priority !== "" ||
  f.overdueOnly;

export const filterTasks = (tasks: Task[], f: TaskFilters): Task[] => {
  const q = f.search.trim().toLowerCase();

  return tasks.filter((t) => {
    if (q) {
      const haystack =
        `${t.title} ${t.key} ${t.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.assignee === "unassigned" && t.assignee) return false;
    if (
      f.assignee &&
      f.assignee !== "unassigned" &&
      t.assignee?._id !== f.assignee
    )
      return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.overdueOnly && getDueState(t.dueDate, t.status) !== "overdue")
      return false;
    return true;
  });
};
