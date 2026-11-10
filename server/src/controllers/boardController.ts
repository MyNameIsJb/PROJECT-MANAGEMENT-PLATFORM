import { Response } from "express";
import Board from "../models/Board";
import { AuthRequest } from "../types";

export const createBoard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, workspaceId } = req.body;
    const board = await Board.create({ name, workspaceId });
    res.status(201).json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBoardsByWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const boards = await Board.find({ workspaceId });
    res.json(boards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
