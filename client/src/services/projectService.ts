import type { CreateProjectInput, Project } from "../types";
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
};
