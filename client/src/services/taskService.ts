import type { CreateTaskInput, Task } from "../types";
import api from "./api";

export const taskService = {
  getByProject: async (projectId: string): Promise<Task[]> => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data.tasks;
  },

  create: async (projectId: string, data: CreateTaskInput): Promise<Task> => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data.task;
  },
};
