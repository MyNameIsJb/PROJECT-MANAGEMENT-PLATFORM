import { useState } from "react";
import type {
  ProjectMember,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from "../../types";
import { toDateInput } from "../../utils/dates";
import TaskComments from "./TaskComments";

interface TaskDetailsModalProps {
  task: Task | null;
  members: ProjectMember[];
  onClose: () => void;
  onSave: (data: UpdateTaskInput) => Promise<void>;
  onDelete: () => Promise<void>;
  currentUserEmail?: string;
  isOwner: boolean;
  onMove: (status: TaskStatus) => Promise<void>;
}

export default function TaskDetailsModal({
  task,
  ...rest
}: TaskDetailsModalProps) {
  if (!task) return null;

  return <TaskDetailsForm key={task._id} task={task} {...rest} />;
}

function TaskDetailsForm({
  task,
  members,
  onClose,
  onSave,
  onDelete,
  currentUserEmail,
  isOwner,
  onMove,
}: Omit<TaskDetailsModalProps, "task"> & { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignee, setAssignee] = useState(task.assignee?._id ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(task.dueDate));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changes: UpdateTaskInput = {};
  if (title.trim() !== task.title) changes.title = title.trim();
  if (description.trim() !== (task.description ?? ""))
    changes.description = description.trim();
  if (priority !== task.priority) changes.priority = priority;
  if (assignee !== (task.assignee?._id ?? ""))
    changes.assignee = assignee || null;
  if (dueDate !== toDateInput(task.dueDate)) changes.dueDate = dueDate || null;

  const canSave = Object.keys(changes).length > 0 && title.trim() !== "";

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

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      setError("");
      await onMove(status);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded bg-blue-600/20 px-2 py-0.5 font-mono text-xs text-blue-400">
              {task.key}
            </span>
            <span className="text-xs text-gray-500">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
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
              Title
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
              Status
            </label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
            >
              <option value="todo" className="bg-gray-800 text-white">
                To Do
              </option>
              <option value="in_progress" className="bg-gray-800 text-white">
                In Progress
              </option>
              <option value="done" className="bg-gray-800 text-white">
                Done
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              >
                <option value="low" className="bg-gray-800 text-white">
                  Low
                </option>
                <option value="medium" className="bg-gray-800 text-white">
                  Medium
                </option>
                <option value="high" className="bg-gray-800 text-white">
                  High
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              >
                <option value="" className="bg-gray-800 text-white">
                  Unassigned
                </option>
                {members.map((m) => (
                  <option
                    key={m._id}
                    value={m._id}
                    className="bg-gray-800 text-white"
                  >
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                  Due date
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate("")}
                    className="text-[11px] text-gray-500 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-800">
            {confirmingDelete ? (
              <div>
                <span className="text-gray-400">Delete this task?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={loading}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Delete
              </button>
            )}

            <div className="flex items-center gap-3">
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
          </div>
        </form>

        <TaskComments
          taskId={task._id}
          currentUserEmail={currentUserEmail}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
