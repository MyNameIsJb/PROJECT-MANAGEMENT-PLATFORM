import { create } from "zustand";
import type { CreateProjectInput, Project } from "../types";
import { projectService } from "../services/projectService";

interface ProjectState {
  projects: Project[];
  createProject: (data: CreateProjectInput) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],

  createProject: async (data) => {
    const project = await projectService.create(data);
    set((state) => ({ projects: [project, ...state.projects] }));
  },
}));
