import type { CreateProjectInput, Project, UpdateProjectInput } from "../types";
import { api } from "./api";

export const projectService = {
  create: async (data: CreateProjectInput): Promise<Project> => {
    const res = await api.post("/projects", data);
    return res.data.project;
  },

  getAll: async (): Promise<Project[]> => {
    const res = await api.get("/projects");
    return res.data.projects;
  },

  addMember: async (projectId: string, email: string): Promise<Project> => {
    const res = await api.post(`/projects/${projectId}/members`, { email });
    return res.data.project;
  },

  update: async (
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<Project> => {
    const res = await api.patch(`/projects/${projectId}`, data);
    return res.data.project;
  },

  remove: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },

  removeMember: async (projectId: string, userId: string): Promise<Project> => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data.project;
  },
};
