import { useEffect, useState } from "react";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import { useActiveProject, useProjectStore } from "../store/projectStore";
import Sidebar from "../components/layout/Sidebar";
import { useTaskStore } from "../store/taskStore";
import {
  TaskStatus,
  type CreateTaskInput,
  type ProjectMember,
  type UpdateProjectInput,
  type UpdateTaskInput,
} from "../types";
import CreateTaskModal from "../components/dashboard/CreateTaskModal";
import { useAuthStore } from "../store/authStore";
import MembersModal from "../components/dashboard/MembersModal";
import { useBoardSocket } from "../hooks/useBoardSocket";
import TaskDetailsModal from "../components/dashboard/TaskDetailsModal";
import ProjectSettingsModal from "../components/dashboard/ProjectSettingsModal";

export default function DashboardPage() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    addMember,
    updateProject,
    deleteProject,
    removeMember,
  } = useProjectStore();
  const activeProject = useActiveProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    tasks,
    error: tasksError,
    fetchTasks,
    createTask,
    assignTask,
    moveTask,
    updateTask,
    deleteTask,
  } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t._id === selectedTaskId) ?? null;
  const activeProjectId = activeProject?._id;
  useBoardSocket(activeProjectId);
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null);
  const { user } = useAuthStore();
  const [membersProjectId, setMembersProjectId] = useState<string | null>(null);
  const [settingsProjectId, setSettingsProjectId] = useState<string | null>(
    null,
  );

  const membersProject =
    projects.find((p) => p._id === membersProjectId) ?? null;
  const settingsProject =
    projects.find((p) => p._id === settingsProjectId) ?? null;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId, fetchTasks]);

  const openModal = () => setIsModalOpen(true);

  const handleCreateTask = async (data: CreateTaskInput) => {
    if (!activeProject) return;
    await createTask(activeProject._id, data);
  };

  const isOwner = !!activeProject && activeProject.owner.email === user?.email;

  const handleInvite = async (email: string) => {
    if (!activeProject) return;
    await addMember(activeProject._id, email);
  };

  const handleRemoveMember = async (
    member: ProjectMember,
    leaving: boolean,
  ) => {
    if (!membersProject) return;
    await removeMember(membersProject._id, member._id, leaving);
  };

  const handleSaveProject = async (data: UpdateProjectInput) => {
    if (!settingsProject) return;
    await updateProject(settingsProject._id, data);
  };

  const handleDeleteProject = async () => {
    if (!settingsProject) return;
    await deleteProject(settingsProject._id);
  };

  const handleSaveTask = async (data: UpdateTaskInput) => {
    if (!selectedTask) return;
    await updateTask(selectedTask._id, data);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask._id);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar onNewProject={openModal} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="border-b border-gray-800 bg-gray-900/50 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {activeProject ? activeProject.name : "Workspace Dashboard"}
            </h1>
            {activeProject?.description && (
              <p className="text-xs text-gray-400 mt-0.5">
                {activeProject.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeProject && (
              <>
                <button
                  onClick={() => setMembersProjectId(activeProject._id)}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex -space-x-2">
                    {activeProject.members.slice(0, 3).map((m) => (
                      <span
                        key={m._id}
                        title={`${m.name} (${m.email})`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-600/30 text-[10px] font-semibold uppercase text-blue-300"
                      >
                        {m.name.charAt(0)}
                      </span>
                    ))}
                  </div>
                  Members ({activeProject.members.length})
                </button>

                {isOwner && (
                  <button
                    onClick={() => setSettingsProjectId(activeProject._id)}
                    className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                )}
              </>
            )}

            <button
              onClick={openModal}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              + New Project
            </button>
          </div>
        </header>

        <div className="p-8 flex-1">
          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : loading && projects.length === 0 ? (
            <p className="text-sm text-gray-500">Loading projects...</p>
          ) : activeProject ? (
            <>
              {tasksError && (
                <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {tasksError}
                </p>
              )}
              <KanbanBoard
                tasks={tasks}
                members={activeProject.members}
                onAddTask={setAddTaskStatus}
                onAssign={assignTask}
                onMoveTask={moveTask}
                onOpenTask={setSelectedTaskId}
              />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center max-w-md mx-auto my-12">
              <h3 className="text-lg font-semibold text-gray-300">
                No Projects Found
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Create your first project board to start tracking tasks with
                drag-and-drop.
              </p>
              <button
                onClick={openModal}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createProject}
      />

      <CreateTaskModal
        status={addTaskStatus}
        members={activeProject?.members ?? []}
        onClose={() => setAddTaskStatus(null)}
        onCreate={handleCreateTask}
      />

      <MembersModal
        isOpen={membersProject !== null}
        onClose={() => setMembersProjectId(null)}
        project={activeProject}
        canInvite={isOwner}
        currentUserEmail={user?.email}
        onInvite={handleInvite}
        onRemove={handleRemoveMember}
      />

      <ProjectSettingsModal
        project={settingsProject}
        onClose={() => setSettingsProjectId(null)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      <TaskDetailsModal
        task={selectedTask}
        members={activeProject?.members ?? []}
        onClose={() => setSelectedTaskId(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
