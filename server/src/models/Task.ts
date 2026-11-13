import { model, Schema } from "mongoose";
import { ITask, TaskPriority, TaskStatus } from "../types";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

const taskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    number: { type: Number, required: true },
    key: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: TASK_STATUSES, default: "todo" },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

taskSchema.index({ project: 1, number: 1 }, { unique: true });
taskSchema.index({ project: 1, status: 1, position: 1 });

export const Task = model<ITask>("Task", taskSchema);
