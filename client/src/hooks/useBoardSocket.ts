import { useEffect } from "react";
import { useTaskStore } from "../store/taskStore";
import { socket } from "../services/socket";
import type { Task } from "../types";
import { useProjectStore } from "../store/projectStore";

export function useBoardSocket(projectId: string | undefined) {
  const applyRemoteTasks = useTaskStore((s) => s.applyRemoteTasks);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);

  useEffect(() => {
    const onError = (err: Error) => console.error("socket error:", err.message);
    socket.on("connect_error", onError);
    socket.connect();

    return () => {
      socket.off("connect_error", onError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const join = () => socket.emit("join_board", projectId);
    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
      socket.emit("leave_board", projectId);
    };
  }, [projectId]);

  useEffect(() => {
    const onUpdated = (payload: { projectId: string; tasks: Task[] }) => {
      applyRemoteTasks(payload.projectId, payload.tasks);
    };
    socket.on("tasks_updated", onUpdated);

    return () => {
      socket.off("task_updated", onUpdated);
    };
  }, [applyRemoteTasks]);

  useEffect(() => {
    const refresh = () => {
      fetchProjects();
    };
    socket.on("project_updated", refresh);
    socket.on("project_removed", refresh);
    socket.on("member_removed", refresh);

    return () => {
      socket.off("project_updated", refresh);
      socket.off("project_removed", refresh);
      socket.off("member_removed", refresh);
    };
  }, [fetchProjects]);
}
