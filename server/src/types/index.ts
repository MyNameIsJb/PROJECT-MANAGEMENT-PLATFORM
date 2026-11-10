import { Request } from "express";
import mongoose, { Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = "admin" | "member";

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  name: string;
  key: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard extends Document {
  name: string;
  workspaceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  boardId: mongoose.Types.ObjectId;
  assignee?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: IUser & { _id: any };
}
