import { create } from "zustand";
import type { CreateProjectInput, Project, UpdateProjectInput } from "../types";
import { projectService } from "../services/projectService";

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
  updateProject: (projectId: string, data: UpdateProjectInput) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  removeMember: (
    projectId: string,
    userId: string,
    leaving: boolean,
  ) => Promise<void>;
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

  addMember: async (projectId, email) => {
    const updated = await projectService.addMember(projectId, email);
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === updated._id ? updated : p,
      ),
    }));
  },

  updateProject: async (projectId, data) => {
    const updated = await projectService.update(projectId, data);
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === updated._id ? updated : p,
      ),
    }));
  },

  deleteProject: async (projectId) => {
    await projectService.remove(projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== projectId),
    }));
  },

  removeMember: async (projectId, userId, leaving) => {
    const updated = await projectService.removeMember(projectId, userId);
    set((state) => ({
      projects: leaving
        ? state.projects.filter((p) => p._id !== projectId)
        : state.projects.map((p) => (p._id === updated._id ? updated : p)),
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
