import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../store/authStore";
import { useActiveProject, useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";

interface SidebarProps {
  onNewProject: () => void;
}

export default function Sidebar({ onNewProject }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { projects, loading, setActiveProject, reset } = useProjectStore();
  const activeProject = useActiveProject();
  const navigate = useNavigate();

  const handleLogout = () => {
    reset();
    useTaskStore.getState().reset();
    logout();
    navigate({ to: "/login" });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "US";

  return (
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
              onClick={onNewProject}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              + New
            </button>
          </div>

          <nav className="space-y-1">
            {loading && projects.length === 0 ? (
              <p className="px-2 text-xs text-gray-500 italic">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="px-2 text-xs text-gray-500 italic">
                No projects yet
              </p>
            ) : (
              projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setActiveProject(p._id)}
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

      <div className="border-t border-gray-800 pt-4 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400 uppercase">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-xs text-white truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
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
  );
}
