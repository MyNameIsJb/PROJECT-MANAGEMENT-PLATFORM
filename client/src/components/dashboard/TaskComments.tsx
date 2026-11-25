import { useEffect, useRef, useState } from "react";
import { useCommentStore } from "../../store/commentStore";
import { timeAgo } from "../../utils/dates";

interface TaskCommentsProps {
  taskId: string;
  currentUserEmail?: string;
  isOwner: boolean;
}

export default function TaskComments({
  taskId,
  currentUserEmail,
  isOwner,
}: TaskCommentsProps) {
  const {
    comments,
    loading,
    error: loadError,
    fetchComments,
    addComment,
    deleteComment,
    reset,
  } = useCommentStore();

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments(taskId);
    return () => reset();
  }, [taskId, fetchComments, reset]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || saving) return;

    try {
      setSaving(true);
      setError("");
      await addComment(taskId, value);
      setText("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setSaving(true);
      setError("");
      await deleteComment(taskId, commentId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setConfirmId(null);
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-800 pt-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h4>

      <div
        ref={listRef}
        className="mt-3 max-h-60 space-y-4 overflow-y-auto pr-1"
      >
        {loading ? (
          <p className="text-xs text-gray-500">Loading comments...</p>
        ) : loadError ? (
          <p className="text-xs text-red-400">{loadError}</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-500">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((c) => {
            const canDelete = isOwner || c.author.email === currentUserEmail;

            return (
              <div key={c._id} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 text-[11px] font-semibold uppercase text-blue-400">
                  {c.author.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {c.author.name}
                    </span>
                    <span
                      className="text-[11px] text-gray-500"
                      title={new Date(c.createdAt).toLocaleString()}
                    >
                      {timeAgo(c.createdAt)}
                    </span>

                    {canDelete &&
                      (confirmId === c._id ? (
                        <span className="ml-auto flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id)}
                            disabled={saving}
                            className="font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(c._id)}
                          className="ml-auto text-[11px] text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      ))}
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-300">
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <textarea
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
          placeholder="Write a comment... (Ctrl+Enter to send)"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Sending..." : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
