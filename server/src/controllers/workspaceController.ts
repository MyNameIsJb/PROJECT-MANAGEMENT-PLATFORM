import { Response } from "express";
import { Workspace } from "../models/Workspace";
import { AuthRequest } from "../types";

export const createWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name,
      owner: userId,
      members: [{ user: userId, role: "admin" }],
    });

    return res.status(201).json({ success: true, workspace });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error creating workspace",
      error,
    });
  }
};

export const getWorkspaces = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const workspaces = await Workspace.find({
      "members.user": userId,
    }).populate("owner", "name email");

    return res.status(200).json({ success: true, workspaces });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching workspaces",
        error,
      });
  }
};
