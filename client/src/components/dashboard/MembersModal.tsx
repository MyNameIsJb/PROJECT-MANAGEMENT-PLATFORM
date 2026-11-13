import { useState } from "react";
import type { Project } from "../../types";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  canInvite: boolean;
  onInvite: (email: string) => Promise<void>;
}

export default function MembersModal({
  isOpen,
  onClose,
  project,
  canInvite,
  onInvite,
}: MembersModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (!isOpen || !project) return null;

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await onInvite(email.trim());
      setEmail("");
      setSuccess(`${email.trim()} added to the project`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold">
            Members{" "}
            <span className="text-gray-400 font-normal">· {project.name}</span>
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto">
          {project.members.map((m) => (
            <li key={m._id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 text-xs font-semibold uppercase text-blue-400">
                {m.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {m.name}
                </p>
                <p className="truncate text-xs text-gray-400">{m.email}</p>
              </div>
              {m._id === project.owner._id && (
                <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                  Owner
                </span>
              )}
            </li>
          ))}
        </ul>

        {canInvite ? (
          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-3 border-t border-gray-800 pt-4"
          >
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
              Invite by email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@email.com"
                className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {success}
              </p>
            )}
          </form>
        ) : (
          <p className="mt-5 border-t border-gray-800 pt-4 text-xs text-gray-500">
            Only the project owner can add members
          </p>
        )}
      </div>
    </div>
  );
}
