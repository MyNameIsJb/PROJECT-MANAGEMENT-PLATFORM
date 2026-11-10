import mongoose, { Schema } from "mongoose";
import { IWorkspace } from "../types";

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, uppercase: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IWorkspace>("Workspace", workspaceSchema);
