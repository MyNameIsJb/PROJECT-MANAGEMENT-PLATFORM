import type { ProjectMember, TaskPriority } from "../../types";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  type TaskFilters,
} from "../../utils/filterTasks";

interface FilterBarProps {
  filters: TaskFilters;
  members: ProjectMember[];
  shownCount: number;
  totalCount: number;
  onChange: (filters: TaskFilters) => void;
}

const selectClass =
  "flex-1 md:flex-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none [color-scheme:dark]";

export default function FilterBar({
  filters,
  members,
  shownCount,
  totalCount,
  onChange,
}: FilterBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search tasks..."
        className="w-full md:w-auto md:min-w-[200px] md:flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />

      <select
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
        className={selectClass}
      >
        <option value="" className="bg-gray-800 text-white">
          All assignees
        </option>
        <option value="unassigned" className="bg-gray-800 text-white">
          Unassigned
        </option>
        {members.map((m) => (
          <option key={m._id} value={m._id} className="bg-gray-800 text-white">
            {m.name}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: e.target.value as "" | TaskPriority,
          })
        }
        className={selectClass}
      >
        <option value="" className="bg-gray-800 text-white">
          All priorities
        </option>
        <option value="high" className="bg-gray-800 text-white">
          High
        </option>
        <option value="medium" className="bg-gray-800 text-white">
          Medium
        </option>
        <option value="low" className="bg-gray-800 text-white">
          Low
        </option>
      </select>

      <button
        type="button"
        onClick={() =>
          onChange({ ...filters, overdueOnly: !filters.overdueOnly })
        }
        className={`rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer ${
          filters.overdueOnly
            ? "border-red-500/40 bg-red-500/10 text-red-400"
            : "border-gray-700 text-gray-300 hover:bg-gray-800"
        }`}
      >
        Overdue only
      </button>

      {active && (
        <>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>
          <span className="text-xs text-gray-500">
            Showing {shownCount} of {totalCount} · drag and drop is paused
          </span>
        </>
      )}
    </div>
  );
}
