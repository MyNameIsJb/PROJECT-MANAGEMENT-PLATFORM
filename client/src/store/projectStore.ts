import { create } from "zustand";
import type { CreateProjectInput, Project } from "../types";
import { projectService } from "../services/projectService";

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<void>;
  setActiveProject: (id: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const projects = await projectService.getAll();
      set({ projects });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to load projects" });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    const project = await projectService.create(data);
    set((state) => ({
      projects: [project, ...state.projects],
      activeProjectId: project._id,
    }));
  },

  setActiveProject: async (id) => set({ activeProjectId: id }),

  reset: () => {
    set({ projects: [], activeProjectId: null, loading: false, error: null });
  },
}));

export const useActiveProject = () =>
  useProjectStore(
    (s) =>
      s.projects.find((p) => p._id === s.activeProjectId) ??
      s.projects[0] ??
      null,
  );
