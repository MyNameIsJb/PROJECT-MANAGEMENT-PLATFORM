import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 px-2 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              TF
            </div>
            <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              TaskFlow PM
            </span>
          </div>

          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-400 border border-blue-500/20"
            >
              Projects & Boards
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Team Settings
            </a>
          </nav>
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
            className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-1"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Workspace Dashboard
          </h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
            + New Project
          </button>
        </header>

        {/* Board / Workspace View Placeholder */}
        <div className="p-8 flex-1">
          <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-300">
              No Projects Found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first project board to start tracking tasks with
              drag-and-drop.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
