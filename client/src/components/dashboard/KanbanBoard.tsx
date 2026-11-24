import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { ProjectMember, Task, TaskStatus } from "../../types";
import { formatDueDate, getDueState } from "../../utils/dates";

interface KanbanBoardProps {
  tasks: Task[];
  members: ProjectMember[];
  onAddTask: (status: "todo" | "in_progress" | "done") => void;
  onAssign: (taskId: string, assigneeId: string | null) => void;
  onMoveTask: (taskId: string, status: TaskStatus, position: number) => void;
  onOpenTask: (taskId: string) => void;
  filtersActive: boolean;
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

export default function KanbanBoard({
  tasks,
  members,
  onAddTask,
  onAssign,
  onMoveTask,
  onOpenTask,
  filtersActive,
}: KanbanBoardProps) {
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

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index == destination.index
    ) {
      return;
    }
    onMoveTask(
      draggableId,
      destination.droppableId as TaskStatus,
      destination.index,
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
        {COLUMNS.map((col) => {
          const columnTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position);

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
              <Droppable droppableId={col.id}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={`flex flex-col gap-3 flex-1 min-h-[120px] rounded-lg transition-colors ${
                      dropSnapshot.isDraggingOver ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {columnTasks.length === 0 &&
                      !dropSnapshot.isDraggingOver && (
                        <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
                          {filtersActive
                            ? "No matching tasks"
                            : `No tasks in ${col.title.toLocaleLowerCase()}`}
                        </div>
                      )}

                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                        isDragDisabled={filtersActive}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => onOpenTask(task._id)}
                            className={`rounded-lg border bg-gray-800/80 p-4 shadow-sm ${
                              filtersActive
                                ? "cursor-pointer"
                                : "cursor-grab active:cursor-grabbing"
                            } ${
                              dragSnapshot.isDragging
                                ? "border-blue-500/60 shadow-lg shadow-blue-500/10"
                                : "border-gray-800 hover:border-gray-700"
                            }`}
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

                            <DueBadge task={task} />

                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 text-[11px] text-gray-400">
                              <select
                                value={task.assignee?._id ?? ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  onAssign(task._id, e.target.value || null)
                                }
                                className="max-w-[60%] cursor-pointer truncate rounded border border-transparent bg-transparent py-0.5 text-[11px] text-gray-400 hover:border-gray-700 hover:text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                              >
                                <option
                                  value=""
                                  className="bg-gray-800 text-white"
                                >
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
                              <span className="font-mono text-gray-500">
                                {task.key}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function DueBadge({ task }: { task: Task }) {
  if (!task.dueDate) return null;

  const state = getDueState(task.dueDate, task.status);
  const styles =
    state === "overdue"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : state === "today"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-gray-500/10 text-gray-400 border-gray-500/20";
  const label =
    state === "today"
      ? "Due today"
      : `${state === "overdue" ? "Overdue" : "Due"} ${formatDueDate(task.dueDate)}`;

  return (
    <div className="mb-3">
      <span
        className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${styles}`}
      >
        {label}
      </span>
    </div>
  );
}
