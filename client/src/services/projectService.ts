import type { CreateProjectInput, Project, Task } from "../types";
import { api } from "./api";

export const projectService = {
  create: async (data: CreateProjectInput): Promise<Project> => {
    const res = await api.post("/projects", data);
    return res.data.project;
  },
};
