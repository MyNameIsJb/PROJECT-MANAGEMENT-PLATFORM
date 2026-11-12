import { useState } from "react";
import type { CreateProjectInput } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateProjectInput) => Promise<void>;
}

const generateKey = (name: string) => {
  const letters = (s: string) => s.replace(/[^a-zA-Z]/g, "");
  const words = name.trim().split(/\s+/).filter(Boolean);
  const raw =
    words.length >= 2
      ? words.map((w) => letters(w).charAt(0)).join("")
      : letters(words[0] ?? "");
  return raw.slice(0, 3).toUpperCase();
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setKey("");
    setKeyTouched(false);
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!keyTouched) setKey(generateKey(val));
  };

  const handleKeyChange = (val: string) => {
    setKeyTouched(val !== "");
    setKey(val.replace(/[^a-zA-Z]/g, "").toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || key.length < 2) {
      setError("Name and a key of at least 2 letters are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onCreate({
        name: name.trim(),
        key,
        description: description.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold">Create New Project</h3>
          <button
            type="button"
            onClick={handleClose}
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
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Project Key (Prefix)
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={5}
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="e.g. MAR"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the workspace..."
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
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
