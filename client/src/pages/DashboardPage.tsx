import { useEffect, useState } from "react";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import { useActiveProject, useProjectStore } from "../store/projectStore";
import Sidebar from "../components/layout/Sidebar";
import { useTaskStore } from "../store/taskStore";

export default function DashboardPage() {
  const { projects, loading, error, fetchProjects, createProject } =
    useProjectStore();
  const activeProject = useActiveProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, error: tasksError, fetchTasks } = useTaskStore();
  const activeProjectId = activeProject?._id;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId, fetchTasks]);

  const openModal = () => setIsModalOpen(true);

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
          <button
            onClick={openModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            + New Project
          </button>
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
              <KanbanBoard tasks={tasks} onAddTask={() => {}} />
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
    </div>
  );
}
