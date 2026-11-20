import { useState } from "react";
import type { Project, UpdateProjectInput } from "../../types";

interface ProjectSettingsModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (data: UpdateProjectInput) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function ProjectSettingsModal({
  project,
  onClose,
  onSave,
  onDelete,
}: ProjectSettingsModalProps) {
  if (!project) return null;

  return (
    <ProjectSettingsForm
      key={project._id}
      project={project}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}

function ProjectSettingsForm({
  project,
  onClose,
  onSave,
  onDelete,
}: {
  project: Project;
  onClose: () => void;
  onSave: (data: UpdateProjectInput) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changes: UpdateProjectInput = {};
  if (name.trim() !== project.name) changes.name = name.trim();
  if (description.trim() !== (project.description ?? ""))
    changes.description = description.trim();

  const canSave = Object.keys(changes).length > 0 && name.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setLoading(true);
      setError("");
      await onSave(changes);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await onDelete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
      setConfirmingDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold">Project Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Project Key
            </label>
            <input
              type="text"
              disabled
              value={project.key}
              className="w-full rounded-lg border border-gray-800 bg-gray-800/50 px-4 py-2.5 text-sm font-mono text-gray-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              The key can't be changed, because every task key is built from it.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-400">Delete project</p>
          <p className="mt-1 text-xs text-gray-400">
            This permanently deletes the project and all of its tasks.
          </p>

          {confirmingDelete ? (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                Yes, delete everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={loading}
              className="mt-3 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Delete this project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
