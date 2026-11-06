import mongoose, { Schema } from "mongoose";
import { IBoard } from "../types";

const boardSchema = new Schema<IBoard>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    columns: { type: [String], default: ["To Do", "In Progress", "Done"] },
  },
  { timestamps: true },
);

export const Board = mongoose.model<IBoard>("Board", boardSchema);
