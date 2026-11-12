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
}
