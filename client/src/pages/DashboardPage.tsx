import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import type { Project, Task } from "../types";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import { useProjectStore } from "../store/projectStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const handleCreateProject = (data: {
    name: string;
    key: string;
    description: string;
  }) => {
    const newProject: Project = {
      _id: Date.now().toString(),
      name: data.name,
      key: data.key,
      description: data.description,
      tasks: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setActiveProject(newProject);
  };

  const handleAddTask = (status: "todo" | "in_progress" | "done") => {
    if (!activeProject) return;

    const newTask: Task = {
      _id: Date.now().toString(),
      title: `Sample task for ${activeProject.key}`,
      status,
      priority: "medium",
    };

    const updatedProjects = projects.map((p) => {
      if (p._id === activeProject._id) {
        return { ...p, tasks: [...(p.tasks || []), newTask] };
      }
      return p;
    });

    setProjects(updatedProjects);
    setActiveProject((prev) =>
      prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null,
    );
  };

  const { createProject } = useProjectStore();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 px-2 cursor-pointer select-none hover:opacity-90 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
              TF
            </div>
            <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              TaskFlow PM
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Projects
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + New
              </button>
            </div>

            <nav className="space-y-1">
              {projects.length === 0 ? (
                <p className="px-2 text-xs text-gray-500 italic">
                  No projects yet
                </p>
              ) : (
                projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      activeProject?._id === p._id
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                      {p.key}
                    </span>
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-gray-800 pt-4 flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400 uppercase">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                : "US"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-1 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
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
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            + New Project
          </button>
        </header>

        {/* Board / Workspace View */}
        <div className="p-8 flex-1">
          {activeProject ? (
            <KanbanBoard
              tasks={activeProject.tasks || []}
              onAddTask={handleAddTask}
            />
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
                onClick={() => setIsModalOpen(true)}
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
