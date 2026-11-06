import { Request } from "express";
import { Types } from "mongoose";

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
  owner: Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard extends Document {
  workspaceId: Types.ObjectId;
  title: string;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITask extends Document {
  boardId: Types.ObjectId;
  title: string;
  description: string;
  column: string;
  order: number;
  assignees: Types.ObjectId[];
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
