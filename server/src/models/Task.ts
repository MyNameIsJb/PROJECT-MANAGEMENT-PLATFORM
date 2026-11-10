import mongoose, { Schema } from "mongoose";
import { ITask } from "../types";

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    assignee: { type: String },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<ITask>("Task", taskSchema);
