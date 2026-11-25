import type {
  CreateTaskInput,
  Task,
  TaskComment,
  TaskStatus,
  UpdateTaskInput,
} from "../types";
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

  assign: async (taskId: string, assignee: string | null): Promise<Task> => {
    const res = await api.patch(`/tasks/${taskId}`, { assignee });
    return res.data.task;
  },

  move: async (
    taskId: string,
    status: TaskStatus,
    position: number,
  ): Promise<Task[]> => {
    const res = await api.patch(`/tasks/${taskId}/move`, { status, position });
    return res.data.tasks;
  },

  update: async (taskId: string, data: UpdateTaskInput): Promise<Task> => {
    const res = await api.patch(`/tasks/${taskId}`, data);
    return res.data.task;
  },

  remove: async (taskId: string): Promise<Task[]> => {
    const rest = await api.delete(`/tasks/${taskId}`);
    return rest.data.tasks;
  },

  getComments: async (taskId: string): Promise<TaskComment[]> => {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data.comments;
  },

  addComment: async (taskId: string, text: string): Promise<TaskComment[]> => {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    return res.data.comments;
  },

  deleteComment: async (
    taskId: string,
    commentId: string,
  ): Promise<TaskComment[]> => {
    const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return res.data.comments;
  },
};
