import { model, Schema } from "mongoose";
import { IProject } from "../types";

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,6}$/, "Key must be 2-6 letters"],
    },
    description: { type: String, trim: true, maxlength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

projectSchema.index({ owner: 1, key: 1 }, { unique: true });

export const Project = model<IProject>("Project", projectSchema);
