import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../types";

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, status, priority, boardId, assignee } =
      req.body;
    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      boardId,
      assignee,
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByBoard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { boardId } = req.params;
    const tasks = await Task.find({ boardId });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskPosition = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status, position } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(status && { status }),
        ...(position !== undefined && { position }),
      },
      { new: true },
    );

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
