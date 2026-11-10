import mongoose, { Schema } from "mongoose";
import { IBoard } from "../types";

const boardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IBoard>("Board", boardSchema);
