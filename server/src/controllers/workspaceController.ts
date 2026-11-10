import { Response } from "express";
import Workspace from "../models/Workspace";
import Board from "../models/Board";
import { AuthRequest } from "../types";

export const createWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, key, description } = req.body;
    const userId = req.user?._id;

    const workspace = await Workspace.create({
      name,
      key,
      description,
      owner: userId,
    });

    // Automatically create a default board for the new workspace
    await Board.create({
      name: "General Board",
      workspaceId: workspace._id,
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaces = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const workspaces = await Workspace.find({ owner: userId });
    res.json(workspaces);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
