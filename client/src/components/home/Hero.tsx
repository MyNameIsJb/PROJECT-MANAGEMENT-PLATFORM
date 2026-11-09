import { Link } from "@tanstack/react-router";
import { useAuthStore } from "../../store/authStore";

export default function Hero() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center text-white">
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="max-w-3xl space-y-6">
        <span className="inline-block rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400 border border-blue-500/20">
          MERN + TanStack Router + Tailwind v4
        </span>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Manage Projects with Precision & Real-Time Sync
        </h1>

        <p className="mx-auto max-w-xl text-base text-gray-400 sm:text-lg">
          An enterprise Jira-style workspace powered by modular Mongoose models,
          drag-and-drop Kanban boards, and WebSocket collaboration.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Welcome back,{" "}
                <strong className="text-white">{user?.name}</strong>
              </span>
              <button
                onClick={logout}
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 border border-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
