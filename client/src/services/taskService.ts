import type { Task } from "../types";
import api from "./api";

export const taskService = {
  getByProject: async (projectId: string): Promise<Task[]> => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data.tasks;
  },
};
