import { create } from "zustand";
import type { Task } from "../types";
import { taskService } from "../services/taskService";

interface TaskState {
  tasks: Task[];
  projectId: string | null;
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
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

  reset: () => set({ tasks: [], projectId: null, loading: false, error: null }),
}));
