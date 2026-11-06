import { Response } from "express";
import { AuthRequest } from "../types";
import { Task } from "../models/Task";

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const {
      boardId,
      title,
      description,
      column,
      assignees,
      priority,
      dueDate,
    } = req.body;

    if (!boardId || !title || !column) {
      return res.status(400).json({
        success: false,
        message: "Board ID, title, and column are required",
      });
    }

    const task = await Task.create({
      boardId,
      title,
      description: description || "",
      column,
      assignees: assignees || [],
      priority: priority || "medium",
      dueDate,
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error creating task", error });
  }
};

export const getTasksByBoard = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({ boardId }).populate(
      "assignees",
      "name email avatar",
    );

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching tasks", error });
  }
};

export const updateTaskPosition = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { taskId } = req.params;
    const { column, order } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { column, order },
      { new: true },
    );

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, task });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error updating task position",
        error,
      });
  }
};
