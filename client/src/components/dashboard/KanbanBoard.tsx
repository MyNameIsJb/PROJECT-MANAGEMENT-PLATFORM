import type { Task, TaskStatus } from "../../types";

interface KanbanBoardProps {
  tasks: Task[];
  onAddTask: (status: "todo" | "in_progress" | "done") => void;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: "todo", title: "To Do", color: "border-gray-700" },
  { id: "in_progress", title: "In Progress", color: "border-blue-500/50" },
  { id: "done", title: "Done", color: "border-emerald-500/50" },
];

export default function KanbanBoard({ tasks, onAddTask }: KanbanBoardProps) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-4 min-h-[500px] ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-200">
                  {col.title}
                </h3>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400 font-mono">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col.id)}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                + Add Task
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
                  No tasks in {col.title.toLocaleLowerCase()}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border border-gray-800 bg-gray-800/80 p-4 shadow-sm hover:border-gray-700 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-white line-clamp-2">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getPriorityColor(
                          task.priority,
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 text-[11px] text-gray-400">
                      <span>{task.assignee || "Unassigned"}</span>
                      <span className="font-mono text-gray-500">
                        #{task._id.slice(-4)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
