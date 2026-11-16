import { create } from "zustand";
import type { CreateTaskInput, Task } from "../types";
import { taskService } from "../services/taskService";

interface TaskState {
  tasks: Task[];
  projectId: string | null;
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, data: CreateTaskInput) => Promise<void>;
  assignTask: (taskId: string, assignee: string | null) => Promise<void>;
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

  reset: () => set({ tasks: [], projectId: null, loading: false, error: null }),
}));
