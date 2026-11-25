import { create } from "zustand";
import type { TaskComment } from "../types";
import { taskService } from "../services/taskService";

interface CommentState {
  taskId: string | null;
  comments: TaskComment[];
  loading: boolean;
  error: string | null;
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  applyRemoteComments: (taskId: string, comments: TaskComment[]) => void;
  reset: () => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  taskId: null,
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (taskId) => {
    set({ taskId, comments: [], loading: true, error: null });
    try {
      const comments = await taskService.getComments(taskId);
      if (get().taskId === taskId) set({ comments });
    } catch (err: any) {
      if (get().taskId === taskId) {
        set({
          error: err.response?.data?.message || "Failed to load comments",
        });
      }
    } finally {
      if (get().taskId === taskId) set({ loading: false });
    }
  },

  addComment: async (taskId, text) => {
    const comments = await taskService.addComment(taskId, text);
    if (get().taskId === taskId) set({ comments });
  },

  deleteComment: async (taskId, commentId) => {
    const comments = await taskService.deleteComment(taskId, commentId);
    if (get().taskId === taskId) set({ comments });
  },

  applyRemoteComments: (taskId, comments) => {
    if (get().taskId === taskId) set({ comments });
  },

  reset: () => set({ taskId: null, comments: [], loading: false, error: null }),
}));
