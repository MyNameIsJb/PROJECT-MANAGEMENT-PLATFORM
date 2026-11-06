import { Response } from "express";
import { AuthRequest } from "../types";
import { Board } from "../models/Board";

export const createBoard = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { workspaceId, title, columns } = req.body;

    if (!workspaceId || !title) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID and title are required",
      });
    }

    const board = await Board.create({
      workspaceId,
      title,
      columns: columns || ["To Do", "In Progress", "Done"],
    });

    return res.status(201).json({ succes: true, board });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error creating board", error });
  }
};

export const getBoardsByWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { workspaceId } = req.params;

    const boards = await Board.find({ workspaceId });

    return res.status(200).json({ success: true, boards });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching boards", error });
  }
};
