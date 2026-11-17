import { create } from "zustand";
import type { CreateTaskInput, Task, TaskStatus } from "../types";
import { taskService } from "../services/taskService";

interface TaskState {
  tasks: Task[];
  projectId: string | null;
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, data: CreateTaskInput) => Promise<void>;
  assignTask: (taskId: string, assignee: string | null) => Promise<void>;
  moveTask: (
    taskId: string,
    status: TaskStatus,
    position: number,
  ) => Promise<void>;
  applyRemoteTasks: (projectId: string, tasks: Task[]) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projectId: null,
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ projectId, tasks: [], loading: true, error: null });
    try {
      const tasks = await taskService.getByProject(projectId);

      if (get().projectId === projectId) set({ tasks });
    } catch (err: any) {
      if (get().projectId === projectId) {
        set({ error: err.response?.data?.message || "Failed to load tasks" });
      }
    } finally {
      if (get().projectId === projectId) set({ loading: false });
    }
  },

  createTask: async (projectId, data) => {
    const task = await taskService.create(projectId, data);

    if (get().projectId === projectId) {
      set((state) => ({ tasks: [...state.tasks, task] }));
    }
  },

  assignTask: async (taskId, assignee) => {
    try {
      set({ error: null });
      const updated = await taskService.assign(taskId, assignee);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === updated._id ? updated : t)),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to updated task" });
    }
  },

  moveTask: async (taskId, status, position) => {
    const previous = get().tasks;
    const projectId = get().projectId;
    const moving = previous.find((t) => t._id === taskId);
    if (!moving) return;

    const byPosition = (a: Task, b: Task) => a.position - b.position;
    const others = previous.filter((t) => t._id !== taskId);

    const destination = others
      .filter((t) => t.status === status)
      .sort(byPosition);
    destination.splice(position, 0, { ...moving, status });

    const source =
      moving.status !== status
        ? others.filter((t) => t.status === moving.status).sort(byPosition)
        : [];

    const rest = others.filter(
      (t) => t.status !== status && t.status !== moving.status,
    );

    set({
      error: null,
      tasks: [
        ...rest,
        ...source.map((t, i) => ({ ...t, position: i })),
        ...destination.map((t, i) => ({ ...t, position: i })),
      ],
    });

    try {
      const tasks = await taskService.move(taskId, status, position);
      if (get().projectId === projectId) set({ tasks });
    } catch (err: any) {
      if (get().projectId === projectId) {
        set({
          tasks: previous,
          error: err.response?.data?.message || "Failed to move task",
        });
      }
    }
  },

  applyRemoteTasks: (projectId, tasks) => {
    if (get().projectId === projectId) set({ tasks });
  },

  reset: () => set({ tasks: [], projectId: null, loading: false, error: null }),
}));
