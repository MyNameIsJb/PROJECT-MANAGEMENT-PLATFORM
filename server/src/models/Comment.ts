import { model, Schema } from "mongoose";
import { IComment } from "../types";

const commentSchema = new Schema<IComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxLength: 1000 },
  },
  { timestamps: true },
);

commentSchema.index({ task: 1, createdAt: 1 });
commentSchema.index({ project: 1 });

export const Comment = model<IComment>("Comment", commentSchema);
