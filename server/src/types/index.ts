import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface IProject extends Document {
  name: string;
  key: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  issueCounter: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  project: Types.ObjectId;
  number: number;
  key: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  reporter: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
